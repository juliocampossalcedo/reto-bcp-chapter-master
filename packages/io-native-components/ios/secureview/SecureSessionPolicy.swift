import Foundation

enum SecureSessionCloseReason: String {
  case userDismiss = "USER_DISMISS"
  case timeout = "TIMEOUT"
}

enum SecureSessionPhase: Equatable {
  case idle
  case opening
  case hidden
  case visible
  case errorHidden
  case closed
}

final class SecureSessionPolicy {
  static let durationNanoseconds: UInt64 = 45_000_000_000

  private(set) var phase: SecureSessionPhase = .idle
  private(set) var didEmitOpened = false
  private(set) var didEmitShown = false
  private(set) var didEmitClosed = false
  private(set) var didEmitCurrentValidationError = false
  let deadlineNanoseconds: UInt64

  init(startNanoseconds: UInt64) {
    let (deadline, overflow) = startNanoseconds.addingReportingOverflow(Self.durationNanoseconds)
    deadlineNanoseconds = overflow ? UInt64.max : deadline
  }

  func presented(now: UInt64) -> SecureSessionCloseReason? {
    guard phase == .idle else { return nil }
    if now >= deadlineNanoseconds { return close(now: now, requested: .timeout) }
    phase = .opening
    didEmitOpened = true
    return nil
  }

  func validationFailed(now: UInt64) -> SecureSessionCloseReason? {
    guard didEmitOpened, !didEmitClosed else { return nil }
    if now >= deadlineNanoseconds { return close(now: now, requested: .timeout) }
    phase = .errorHidden
    didEmitCurrentValidationError = true
    return nil
  }

  func reveal(now: UInt64, captured: Bool) -> SecureSessionCloseReason? {
    guard didEmitOpened, !didEmitClosed else { return nil }
    if now >= deadlineNanoseconds { return close(now: now, requested: .timeout) }
    guard !captured, phase != .errorHidden else {
      phase = .hidden
      return nil
    }
    phase = .visible
    didEmitCurrentValidationError = false
    return nil
  }

  func hide() {
    guard !didEmitClosed, didEmitOpened else { return }
    if phase == .visible { phase = .hidden }
  }

  func markDataShown(now: UInt64) -> Bool {
    guard phase == .visible, !didEmitClosed, !didEmitShown,
          now < deadlineNanoseconds else { return false }
    didEmitShown = true
    return true
  }

  @discardableResult
  func close(now: UInt64, requested: SecureSessionCloseReason) -> SecureSessionCloseReason? {
    guard didEmitOpened, !didEmitClosed else { return nil }
    let reason: SecureSessionCloseReason = now >= deadlineNanoseconds ? .timeout : requested
    phase = .closed
    didEmitClosed = true
    return reason
  }
}
