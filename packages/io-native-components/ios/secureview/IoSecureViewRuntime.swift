import Darwin
import Foundation
import UIKit

@objc(IoSecureViewRuntime)
public final class IoSecureViewRuntime: NSObject {
  private let tokenService = try? SecureTokenService()
  private weak var eventSink: SecureViewEventSink?
  private var controller: CardSecureViewController?
  private var policy: SecureSessionPolicy?
  private var activeCardId: String?
  private var activeToken: String?
  private var observers: [NSObjectProtocol] = []

  @objc public func issueSecureToken(_ cardId: String) -> NSDictionary? {
    guard let token = try? tokenService?.issue(cardId: cardId) else { return nil }
    return ["value": token.value, "expiresAtEpochMs": NSNumber(value: token.expiresAtEpochMs)]
  }

  @objc public func openSecureView(
    _ cardId: String,
    token: String,
    eventSink: SecureViewEventSink,
    completion: @escaping (Bool, String?) -> Void
  ) {
    DispatchQueue.main.async {
      guard self.controller == nil else { completion(false, "BUSY"); return }
      guard NativeMockCardRepository.contains(cardId), self.tokenService != nil,
            let scene = UIApplication.shared.connectedScenes
              .compactMap({ $0 as? UIWindowScene })
              .first(where: { $0.activationState == .foregroundActive }),
            let root = scene.windows.first(where: { $0.isKeyWindow })?.rootViewController else {
        completion(false, "UNAVAILABLE")
        return
      }
      var presenter = root
      while let presented = presenter.presentedViewController { presenter = presented }
      let controller = CardSecureViewController()
      controller.modalPresentationStyle = .fullScreen
      controller.onDismiss = { [weak self] in self?.close(requested: .userDismiss) }
      self.controller = controller
      self.policy = SecureSessionPolicy(startNanoseconds: Self.continuousNanoseconds())
      self.eventSink = eventSink
      self.activeCardId = cardId
      self.activeToken = token
      self.installObservers()
      presenter.present(controller, animated: true) {
        let now = Self.continuousNanoseconds()
        guard let policy = self.policy, now < policy.deadlineNanoseconds,
              policy.presented(now: now) == nil else {
          self.close(requested: .timeout)
          completion(false, "UNAVAILABLE")
          return
        }
        self.eventSink?.secureViewOpened(cardId)
        completion(true, nil)
        self.validateAndReveal()
        let deadline = policy.deadlineNanoseconds
        let remaining = deadline > Self.continuousNanoseconds() ? deadline - Self.continuousNanoseconds() : 0
        DispatchQueue.main.asyncAfter(deadline: .now() + .nanoseconds(Int(min(remaining, UInt64(Int.max))))) { [weak self, weak controller] in
          guard self?.controller === controller else { return }
          self?.close(requested: .timeout)
        }
      }
    }
  }

  private func installObservers() {
    let center = NotificationCenter.default
    observers = [
      center.addObserver(forName: UIApplication.willResignActiveNotification, object: nil, queue: .main) { [weak self] _ in
        self?.hide()
      },
      center.addObserver(forName: UIApplication.didBecomeActiveNotification, object: nil, queue: .main) { [weak self] _ in
        self?.validateAndReveal()
      },
      center.addObserver(forName: UIScreen.capturedDidChangeNotification, object: nil, queue: .main) { [weak self] _ in
        if UIScreen.main.isCaptured { self?.hide() } else { self?.validateAndReveal() }
      },
      center.addObserver(forName: UIApplication.userDidTakeScreenshotNotification, object: nil, queue: .main) { [weak self] _ in
        self?.hide()
      }
    ]
  }

  private func hide() {
    controller?.clearSensitiveData()
    policy?.hide()
  }

  private func validateAndReveal() {
    guard let controller, let policy, let cardId = activeCardId, let token = activeToken else { return }
    hide()
    let now = Self.continuousNanoseconds()
    if now >= policy.deadlineNanoseconds { close(requested: .timeout); return }
    guard !UIScreen.main.isCaptured,
          UIApplication.shared.applicationState == .active else { return }
    switch tokenService?.validate(cardId: cardId, token: token) ?? .invalid {
    case .valid:
      guard let details = NativeMockCardRepository.get(cardId) else { return }
      _ = policy.reveal(now: now, captured: false)
      controller.show(details)
      DispatchQueue.main.async { [weak self, weak controller] in
        guard let self, let controller, self.controller === controller,
              !controller.view.isHidden,
              self.policy?.markDataShown(now: Self.continuousNanoseconds()) == true else { return }
        self.eventSink?.secureViewDataShown(cardId)
      }
    case .expired:
      let shouldEmit = !policy.didEmitCurrentValidationError
      _ = policy.validationFailed(now: now)
      let message = "La autorización venció. Vuelve a solicitarla."
      controller.showError(message)
      if shouldEmit { eventSink?.secureViewValidationFailed("TOKEN_EXPIRED", message: message) }
    case .invalid:
      let shouldEmit = !policy.didEmitCurrentValidationError
      _ = policy.validationFailed(now: now)
      let message = "No se pudo validar el acceso. Vuelve a intentarlo."
      controller.showError(message)
      if shouldEmit { eventSink?.secureViewValidationFailed("TOKEN_INVALID", message: message) }
    }
  }

  private func close(requested: SecureSessionCloseReason) {
    guard let controller, let policy, let cardId = activeCardId else { return }
    hide()
    let reason = policy.close(now: Self.continuousNanoseconds(), requested: requested)
    for observer in observers { NotificationCenter.default.removeObserver(observer) }
    observers.removeAll()
    self.controller = nil
    self.policy = nil
    activeCardId = nil
    activeToken = nil
    if let reason { eventSink?.secureViewClosed(cardId, reason: reason.rawValue) }
    eventSink = nil
    controller.dismiss(animated: true)
  }

  private static func continuousNanoseconds() -> UInt64 {
    var timebase = mach_timebase_info_data_t()
    mach_timebase_info(&timebase)
    let ticks = mach_continuous_time()
    let numerator = UInt64(timebase.numer)
    let denominator = UInt64(timebase.denom)
    return (ticks / denominator) * numerator + ((ticks % denominator) * numerator) / denominator
  }
}
