import MapKit
import UIKit

@objc(CustomMapCanvasView)
public final class CustomMapCanvasView: UIView {
  @objc public weak var eventSink: CustomMapEventSink?

  private final class MarkerSelectionDelegate: NSObject, MKMapViewDelegate {
    weak var owner: CustomMapCanvasView?

    func mapView(_ mapView: MKMapView, didSelect view: MKAnnotationView) {
      owner?.didSelect(annotation: view.annotation)
    }
  }

  private final class MarkerAnnotation: NSObject, MKAnnotation {
    let id: String
    dynamic var coordinate: CLLocationCoordinate2D
    var title: String?

    init(_ marker: NativeMapMarker) {
      id = marker.id
      coordinate = CLLocationCoordinate2D(latitude: marker.latitude, longitude: marker.longitude)
      title = marker.title
    }
  }

  private let mapView = MKMapView(frame: .zero)
  private let selectionDelegate = MarkerSelectionDelegate()
  private let reconciler = MapMarkerReconciler()
  private var annotationsById: [String: MarkerAnnotation] = [:]
  private var selectedId: String?
  private var lastFocusedCoordinate: CLLocationCoordinate2D?
  private var suppressSelectionEvent = false
  private var didReportAvailability = false

  public override init(frame: CGRect) {
    super.init(frame: frame)
    mapView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    mapView.frame = bounds
    selectionDelegate.owner = self
    mapView.delegate = selectionDelegate
    addSubview(mapView)

    let zoomIn = makeZoomButton(symbol: "plus", label: "Acercar mapa", action: #selector(zoomInTapped))
    let zoomOut = makeZoomButton(symbol: "minus", label: "Alejar mapa", action: #selector(zoomOutTapped))
    let controls = UIStackView(arrangedSubviews: [zoomIn, zoomOut])
    controls.axis = .vertical
    controls.spacing = 8
    controls.translatesAutoresizingMaskIntoConstraints = false
    addSubview(controls)
    NSLayoutConstraint.activate([
      controls.topAnchor.constraint(equalTo: topAnchor, constant: 12),
      controls.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -12)
    ])
  }

  public required init?(coder: NSCoder) { nil }

  private func makeZoomButton(symbol: String, label: String, action: Selector) -> UIButton {
    let button = UIButton(type: .system)
    button.setImage(UIImage(systemName: symbol, withConfiguration: UIImage.SymbolConfiguration(pointSize: 18, weight: .bold)), for: .normal)
    button.tintColor = UIColor(red: 0.08, green: 0.22, blue: 0.43, alpha: 1)
    button.backgroundColor = .systemBackground
    button.layer.cornerRadius = 12
    button.layer.shadowColor = UIColor.black.cgColor
    button.layer.shadowOpacity = 0.18
    button.layer.shadowRadius = 3
    button.layer.shadowOffset = CGSize(width: 0, height: 1)
    button.accessibilityLabel = label
    button.accessibilityTraits = .button
    button.widthAnchor.constraint(equalToConstant: 44).isActive = true
    button.heightAnchor.constraint(equalToConstant: 44).isActive = true
    button.addTarget(self, action: action, for: .touchUpInside)
    return button
  }

  @objc private func zoomInTapped() { changeZoom(by: 0.5) }
  @objc private func zoomOutTapped() { changeZoom(by: 2) }

  private func changeZoom(by factor: Double) {
    let region = mapView.region
    let span = MKCoordinateSpan(
      latitudeDelta: min(max(region.span.latitudeDelta * factor, 0.002), 60),
      longitudeDelta: min(max(region.span.longitudeDelta * factor, 0.002), 180)
    )
    mapView.setRegion(MKCoordinateRegion(center: region.center, span: span), animated: true)
  }

  @objc public func setMarkers(_ rawMarkers: [[String: Any]]) {
    let markers = rawMarkers.compactMap { raw -> NativeMapMarker? in
      guard let id = raw["id"] as? String,
            let latitude = raw["latitude"] as? Double,
            let longitude = raw["longitude"] as? Double else { return nil }
      return NativeMapMarker(id: id, latitude: latitude, longitude: longitude, title: raw["title"] as? String)
    }
    let changes = reconciler.update(markers)
    for id in changes.removed {
      if let annotation = annotationsById.removeValue(forKey: id) { mapView.removeAnnotation(annotation) }
    }
    for marker in changes.updated {
      if let annotation = annotationsById[marker.id] {
        annotation.coordinate = CLLocationCoordinate2D(latitude: marker.latitude, longitude: marker.longitude)
        annotation.title = marker.title
      }
    }
    for marker in changes.added {
      let annotation = MarkerAnnotation(marker)
      annotationsById[marker.id] = annotation
      mapView.addAnnotation(annotation)
    }
    setSelectedMarkerId(selectedId)
  }

  @objc public func setSelectedMarkerId(_ candidate: String?) {
    let validId = reconciler.selectedId(candidate)
    guard let validId, let annotation = annotationsById[validId] else {
      selectedId = nil
      lastFocusedCoordinate = nil
      return
    }
    let coordinate = annotation.coordinate
    let needsFocus = selectedId != validId ||
      lastFocusedCoordinate?.latitude != coordinate.latitude ||
      lastFocusedCoordinate?.longitude != coordinate.longitude
    selectedId = validId
    guard needsFocus else { return }
    suppressSelectionEvent = true
    mapView.selectAnnotation(annotation, animated: true)
    mapView.setRegion(
      MKCoordinateRegion(
        center: coordinate,
        span: MKCoordinateSpan(latitudeDelta: 0.035, longitudeDelta: 0.035)
      ),
      animated: lastFocusedCoordinate != nil
    )
    lastFocusedCoordinate = coordinate
    suppressSelectionEvent = false
  }

  public override func didMoveToWindow() {
    super.didMoveToWindow()
    if window != nil && !didReportAvailability {
      didReportAvailability = true
      eventSink?.mapDidBecomeAvailable()
    }
  }

  private func didSelect(annotation: MKAnnotation?) {
    guard !suppressSelectionEvent,
          let marker = annotation as? MarkerAnnotation,
          reconciler.contains(marker.id) else { return }
    selectedId = marker.id
    eventSink?.mapDidPressMarker(marker.id)
  }
}
