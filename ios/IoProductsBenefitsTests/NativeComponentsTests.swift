import XCTest
@testable import IoNativeComponents

final class NativeComponentsTests: XCTestCase {
  func testTokenIsValidThenExpiresAtBoundary() throws {
    var now: Int64 = 1_000_000
    let service = try SecureTokenService(
      testKey: Data(repeating: 7, count: 32),
      nowEpochMs: { now },
      nonceSource: { Data(repeating: 3, count: 16) }
    )
    let issued = try service.issue(cardId: "card_001")
    XCTAssertEqual(issued.expiresAtEpochMs, now + 60_000)
    XCTAssertEqual(service.validate(cardId: "card_001", token: issued.value), .valid)
    now = issued.expiresAtEpochMs
    XCTAssertEqual(service.validate(cardId: "card_001", token: issued.value), .expired)
  }

  func testTokenRejectsTamperingWrongCardAndOtherKey() throws {
    let key = Data(repeating: 7, count: 32)
    let service = try SecureTokenService(testKey: key, nowEpochMs: { 1_000_000 }, nonceSource: { Data(repeating: 3, count: 16) })
    let issued = try service.issue(cardId: "card_001")
    XCTAssertEqual(service.validate(cardId: "card_002", token: issued.value), .invalid)
    XCTAssertEqual(service.validate(cardId: "card_001", token: issued.value + "A"), .invalid)
    let other = try SecureTokenService(testKey: Data(repeating: 8, count: 32), nowEpochMs: { 1_000_000 })
    XCTAssertEqual(other.validate(cardId: "card_001", token: issued.value), .invalid)
  }

  func testSessionShowsOnceAndClosesAtAbsoluteDeadline() {
    let start: UInt64 = 1_000
    let session = SecureSessionPolicy(startNanoseconds: start)
    XCTAssertNil(session.presented(now: start))
    XCTAssertNil(session.reveal(now: start + 1, captured: false))
    XCTAssertTrue(session.markDataShown(now: start + 2))
    XCTAssertFalse(session.markDataShown(now: start + 3))
    session.hide()
    XCTAssertEqual(session.phase, .hidden)
    XCTAssertEqual(session.close(now: session.deadlineNanoseconds, requested: .userDismiss), .timeout)
    XCTAssertNil(session.close(now: session.deadlineNanoseconds, requested: .userDismiss))
  }

  func testValidationErrorKeepsDataHiddenAcrossRepeatedChecks() {
    let session = SecureSessionPolicy(startNanoseconds: 1_000)
    XCTAssertNil(session.presented(now: 1_000))
    XCTAssertNil(session.validationFailed(now: 1_001))
    XCTAssertTrue(session.didEmitCurrentValidationError)
    XCTAssertEqual(session.phase, .errorHidden)
    XCTAssertNil(session.validationFailed(now: 1_002))
    XCTAssertFalse(session.markDataShown(now: 1_003))
  }

  func testMapReconcilesAndRejectsInvalidSelection() {
    let map = MapMarkerReconciler()
    let first = NativeMapMarker(id: "one", latitude: 0, longitude: 0, title: nil)
    let changed = NativeMapMarker(id: "one", latitude: -12, longitude: -77, title: "Lima")
    let invalid = NativeMapMarker(id: "bad", latitude: 91, longitude: 0, title: nil)
    XCTAssertEqual(map.update([first, first, invalid]).added.count, 1)
    XCTAssertEqual(map.selectedId("one"), "one")
    XCTAssertNil(map.selectedId("missing"))
    XCTAssertEqual(map.update([changed]).updated.count, 1)
    XCTAssertEqual(map.update([]).removed, ["one"])
    XCTAssertFalse(map.contains("one"))
  }
}
