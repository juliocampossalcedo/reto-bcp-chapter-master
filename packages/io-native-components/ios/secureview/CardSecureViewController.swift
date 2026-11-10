import UIKit

final class CardSecureViewController: UIViewController {
  var onDismiss: (() -> Void)?
  private let status = UILabel()
  private let sensitiveStack = UIStackView()
  private var sensitiveLabels: [UILabel] = []

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = UIColor(red: 0.96, green: 0.97, blue: 0.99, alpha: 1)
    let title = UILabel()
    title.text = "Datos de tu tarjeta"
    title.font = .boldSystemFont(ofSize: 28)
    title.textColor = UIColor(red: 0.06, green: 0.15, blue: 0.28, alpha: 1)
    status.text = "Validando acceso…"
    status.numberOfLines = 0
    status.font = .systemFont(ofSize: 17)
    sensitiveStack.axis = .vertical
    sensitiveStack.spacing = 12
    sensitiveStack.backgroundColor = UIColor(red: 0.09, green: 0.24, blue: 0.46, alpha: 1)
    sensitiveStack.layer.cornerRadius = 12
    sensitiveStack.layoutMargins = UIEdgeInsets(top: 20, left: 20, bottom: 20, right: 20)
    sensitiveStack.isLayoutMarginsRelativeArrangement = true
    sensitiveStack.isHidden = true
    let hide = UIButton(type: .system)
    hide.setTitle("Ocultar", for: .normal)
    hide.accessibilityLabel = "Ocultar datos de tarjeta"
    hide.titleLabel?.font = .boldSystemFont(ofSize: 18)
    hide.addTarget(self, action: #selector(dismissTapped), for: .touchUpInside)
    hide.heightAnchor.constraint(greaterThanOrEqualToConstant: 48).isActive = true
    let stack = UIStackView(arrangedSubviews: [title, status, sensitiveStack, hide])
    stack.axis = .vertical
    stack.spacing = 24
    stack.translatesAutoresizingMaskIntoConstraints = false
    view.addSubview(stack)
    NSLayoutConstraint.activate([
      stack.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor, constant: 24),
      stack.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor, constant: -24),
      stack.centerYAnchor.constraint(equalTo: view.safeAreaLayoutGuide.centerYAnchor)
    ])
  }

  @objc private func dismissTapped() { onDismiss?() }

  func show(_ details: NativeCardDetails) {
    clearSensitiveData()
    status.text = "Información temporal. Se ocultará automáticamente."
    for (name, value) in [
      ("Número de tarjeta", details.pan), ("CVV", details.cvv),
      ("Vencimiento", details.expiry), ("Titular", details.holder)
    ] {
      let label = UILabel()
      label.text = "\(name): \(value)"
      label.numberOfLines = 0
      label.textColor = .white
      label.font = .systemFont(ofSize: 18)
      sensitiveStack.addArrangedSubview(label)
      sensitiveLabels.append(label)
    }
    sensitiveStack.isHidden = false
  }

  func showError(_ message: String) {
    clearSensitiveData()
    status.text = message
  }

  func clearSensitiveData() {
    sensitiveStack.isHidden = true
    for label in sensitiveLabels {
      label.text = nil
      sensitiveStack.removeArrangedSubview(label)
      label.removeFromSuperview()
    }
    sensitiveLabels.removeAll()
  }

  override func viewWillDisappear(_ animated: Bool) {
    clearSensitiveData()
    super.viewWillDisappear(animated)
  }
}
