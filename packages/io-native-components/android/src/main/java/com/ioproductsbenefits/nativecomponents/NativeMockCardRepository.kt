package com.ioproductsbenefits.nativecomponents

data class NativeCardDetails(val pan: String, val cvv: String, val expiry: String, val holder: String)

object NativeMockCardRepository {
  private val cards = mapOf(
    "card_001" to NativeCardDetails("4111111111111234", "123", "12/28", "TITULAR DEMO UNO"),
    "card_002" to NativeCardDetails("5555555555555678", "456", "06/29", "TITULAR DEMO DOS"),
    "card_003" to NativeCardDetails("4111111111119012", "789", "03/30", "TITULAR DEMO TRES"),
  )
  fun contains(cardId: String) = cards.containsKey(cardId)
  fun get(cardId: String): NativeCardDetails? = cards[cardId]
}
