import Foundation

struct NativeCardDetails {
  let pan: String
  let cvv: String
  let expiry: String
  let holder: String
}

enum NativeMockCardRepository {
  private static let cards: [String: NativeCardDetails] = [
    "card_001": NativeCardDetails(pan: "4111111111111234", cvv: "123", expiry: "12/28", holder: "TITULAR DEMO UNO"),
    "card_002": NativeCardDetails(pan: "5555555555555678", cvv: "456", expiry: "06/29", holder: "TITULAR DEMO DOS"),
    "card_003": NativeCardDetails(pan: "4111111111119012", cvv: "789", expiry: "03/30", holder: "TITULAR DEMO TRES"),
  ]

  static func contains(_ cardId: String) -> Bool { cards[cardId] != nil }
  static func get(_ cardId: String) -> NativeCardDetails? { cards[cardId] }
}
