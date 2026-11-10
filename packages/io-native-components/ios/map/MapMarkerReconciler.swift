import Foundation

struct NativeMapMarker: Equatable {
  let id: String
  let latitude: Double
  let longitude: Double
  let title: String?

  var isValid: Bool {
    !id.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
      latitude.isFinite && longitude.isFinite &&
      (-90.0...90.0).contains(latitude) && (-180.0...180.0).contains(longitude)
  }
}

struct MapMarkerChanges {
  let added: [NativeMapMarker]
  let updated: [NativeMapMarker]
  let removed: [String]
}

final class MapMarkerReconciler {
  private(set) var markersById: [String: NativeMapMarker] = [:]

  @discardableResult
  func update(_ input: [NativeMapMarker]) -> MapMarkerChanges {
    var next: [String: NativeMapMarker] = [:]
    for marker in input where marker.isValid && next[marker.id] == nil {
      next[marker.id] = marker
    }
    let changes = MapMarkerChanges(
      added: next.values.filter { markersById[$0.id] == nil },
      updated: next.values.filter { marker in
        guard let previous = markersById[marker.id] else { return false }
        return previous != marker
      },
      removed: markersById.keys.filter { next[$0] == nil }
    )
    markersById = next
    return changes
  }

  func selectedId(_ candidate: String?) -> String? {
    guard let candidate, !candidate.isEmpty, markersById[candidate] != nil else { return nil }
    return candidate
  }

  func contains(_ id: String) -> Bool { markersById[id] != nil }
}
