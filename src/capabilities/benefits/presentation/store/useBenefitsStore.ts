import { create } from 'zustand';
import type { EligibleBenefits } from '../../application/usecases/loadEligibleBenefits';
import { reconcileBenefitSelection } from '../utils/reconcileBenefitSelection';

export type BenefitsLoader = () => Promise<EligibleBenefits>;
interface BenefitsState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  data: EligibleBenefits | null;
  source: BenefitsLoader | null;
  requestVersion: number;
  selectedBenefitId: string | null;
  startLoad: (source: BenefitsLoader, force?: boolean) => () => void;
  selectBenefit: (id: string) => void;
}
const ids = (data: EligibleBenefits | null) =>
  data?.benefits.map(b => String(b.id)) ?? [];

/** Session memory only. Data is the existing eligible/located snapshot, never a second catalogue. */
export const useBenefitsStore = create<BenefitsState>((set, get) => ({
  status: 'idle',
  data: null,
  source: null,
  requestVersion: 0,
  selectedBenefitId: null,
  startLoad(source, force = false) {
    if (
      !force &&
      get().source === source &&
      get().data !== null &&
      get().status === 'ready'
    ) {
      return () => {};
    }
    const version = get().requestVersion + 1;
    set({ status: 'loading', source, requestVersion: version });
    // Defer invocation so synchronous exceptions follow the same safe error path.
    Promise.resolve()
      .then(source)
      .then(data => {
        if (get().requestVersion !== version) {
          return;
        }
        const selectedBenefitId = reconcileBenefitSelection(
          ids(get().data),
          ids(data),
          get().selectedBenefitId,
        );
        set({ data, selectedBenefitId, status: 'ready' });
      })
      .catch(() => {
        if (get().requestVersion === version) {
          set({ status: 'error' });
        }
      });
    return () => {
      if (get().requestVersion === version && get().status === 'loading') {
        set({ requestVersion: version + 1, status: 'idle' });
      }
    };
  },
  selectBenefit(id) {
    const state = get();
    if (id !== state.selectedBenefitId && ids(state.data).includes(id)) {
      set({ selectedBenefitId: id });
    }
  },
}));
