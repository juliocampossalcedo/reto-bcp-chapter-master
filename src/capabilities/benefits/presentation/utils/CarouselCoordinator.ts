export interface CarouselScrollPort {
  toIndex: (index: number, animated: boolean) => void;
  toOffset: (offset: number) => void;
}
export interface CarouselScheduler {
  later: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>;
  cancel: (handle: ReturnType<typeof setTimeout>) => void;
}
const scheduler: CarouselScheduler = {
  later: (callback, delay) => setTimeout(callback, delay),
  cancel: handle => clearTimeout(handle),
};

/** No selection state: only transient gesture, alignment and dataset guards. */
export class CarouselCoordinator {
  private ids: readonly string[] = [];
  private stride = 0;
  private active = false;
  private epoch = 0;
  private gesture = false;
  private gestureStartedAt = 0;
  private momentum = false;
  private offset = 0;
  private offsetRevision = 0;
  private pending: { id: string; epoch: number; retried: boolean } | null =
    null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private retries: ReturnType<typeof setTimeout> | null = null;
  private disposed = false;

  constructor(
    private readonly scroll: CarouselScrollPort,
    private readonly settle: (id: string) => void,
    private readonly clock: CarouselScheduler = scheduler,
  ) {}

  configure(ids: readonly string[], stride: number, active: boolean): boolean {
    const changed =
      this.disposed ||
      stride !== this.stride ||
      active !== this.active ||
      ids.join(',') !== this.ids.join(',');
    this.disposed = false;
    if (changed) {
      this.invalidate();
      this.ids = ids;
      this.stride = stride;
      this.active = active;
    }
    return changed;
  }
  align(id: string | null, animated: boolean) {
    if (this.disposed || !this.active || this.stride <= 0 || id === null) {
      return;
    }
    const index = this.ids.indexOf(id);
    if (index < 0) {
      return;
    }
    this.invalidate();
    this.pending = { id, epoch: this.epoch, retried: false };
    this.scroll.toIndex(index, animated && this.ids.length > 1);
  }
  private cancelTimer() {
    if (this.timer !== null) {
      this.clock.cancel(this.timer);
      this.timer = null;
    }
  }
  private invalidate() {
    this.epoch++;
    this.cancelTimer();
    if (this.retries !== null) {
      this.clock.cancel(this.retries);
      this.retries = null;
    }
    this.pending = null;
    this.gesture = false;
    this.momentum = false;
  }
  beginDrag(timestamp = 0) {
    if (
      !this.active ||
      this.ids.length < 2 ||
      this.stride <= 0 ||
      this.disposed
    ) {
      return;
    }
    this.invalidate();
    this.gesture = true;
    this.gestureStartedAt = timestamp;
  }
  scrollOffset(offset: number, timestamp = Infinity) {
    if (
      !Number.isFinite(offset) ||
      this.disposed ||
      (this.gesture && timestamp < this.gestureStartedAt)
    ) {
      return;
    }
    if (Math.abs(offset - this.offset) > 0.5) {
      this.offsetRevision++;
    }
    this.offset = offset;
  }
  endDrag(offset: number, timestamp = Infinity) {
    if (timestamp < this.gestureStartedAt) {
      return;
    }
    this.scrollOffset(offset, timestamp);
    if (!this.gesture) {
      return;
    }
    const epoch = this.epoch;
    let previous = this.offsetRevision;
    let checks = 0;
    // Observe stability over two 64ms windows, at a snap point. Momentum cancels this task.
    const check = () => {
      this.timer = null;
      if (
        this.disposed ||
        !this.gesture ||
        this.momentum ||
        epoch !== this.epoch
      ) {
        return;
      }
      const stable = previous === this.offsetRevision;
      const snapped =
        Math.abs(
          this.offset - Math.round(this.offset / this.stride) * this.stride,
        ) <= 2;
      if (stable && snapped && checks >= 1) {
        this.commit();
        return;
      }
      previous = this.offsetRevision;
      if (++checks < 8) {
        this.timer = this.clock.later(check, 64);
      } else {
        this.gesture = false;
      } // Bounded: no polling remains after an unresolved gesture.
    };
    this.cancelTimer();
    this.timer = this.clock.later(check, 64);
  }
  momentumBegin(timestamp = Infinity) {
    if (this.gesture && timestamp >= this.gestureStartedAt) {
      this.momentum = true;
      this.cancelTimer();
    }
  }
  momentumEnd(offset: number, timestamp = Infinity) {
    if (
      this.disposed ||
      !this.active ||
      (this.gesture && timestamp < this.gestureStartedAt)
    ) {
      return;
    }
    this.scrollOffset(offset, timestamp);
    if (this.gesture && this.momentum) {
      this.commit();
      return;
    }
    // Programmatic completions only acknowledge the current target; old A cannot clear B.
    const target = this.pending;
    if (
      target &&
      target.epoch === this.epoch &&
      this.ids[Math.round(offset / this.stride)] === target.id
    ) {
      this.pending = null;
    }
  }
  private commit() {
    if (!this.gesture || !this.active || !this.ids.length || this.stride <= 0) {
      return;
    }
    const index = Math.max(
      0,
      Math.min(this.ids.length - 1, Math.round(this.offset / this.stride)),
    );
    const id = this.ids[index];
    this.cancelTimer();
    this.gesture = false;
    this.momentum = false;
    this.pending = null;
    this.settle(id);
  }
  failed(index: number) {
    const target = this.pending;
    if (
      !target ||
      target.retried ||
      target.epoch !== this.epoch ||
      this.stride <= 0 ||
      !this.active ||
      this.disposed
    ) {
      return;
    }
    const currentIndex = this.ids.indexOf(target.id);
    if (currentIndex < 0 || currentIndex !== index) {
      return;
    }
    target.retried = true;
    this.scroll.toOffset(currentIndex * this.stride);
    this.retries = this.clock.later(() => {
      this.retries = null;
      if (
        !this.disposed &&
        this.pending === target &&
        target.epoch === this.epoch &&
        this.active
      ) {
        this.scroll.toIndex(currentIndex, false);
      }
    }, 32);
  }
  dispose() {
    this.invalidate();
    this.disposed = true;
  }
}

export function carouselGeometry(width: number, count: number) {
  const gap = count > 1 ? 12 : 0;
  const cardWidth = width > 0 ? Math.max(1, width - (count > 1 ? 24 : 0)) : 0;
  return { cardWidth, gap, stride: cardWidth > 0 ? cardWidth + gap : 0 };
}
