package com.ioproductsbenefits.nativecomponents

import java.util.Base64
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Test

class TokenCodecTest {
  private var now = 1_000_000L
  private val codec = TokenCodec(
    clock = { now },
    secret = ByteArray(32) { 7 },
    encode = { Base64.getUrlEncoder().withoutPadding().encodeToString(it) },
    decode = { Base64.getUrlDecoder().decode(it) },
  )

  @Test fun validAndRenewed() {
    val first = codec.issue("card_001")
    val second = codec.issue("card_001")
    assertNotEquals(first.value, second.value)
    assertEquals(now + 60_000L, first.expiresAtEpochMs)
    assertEquals(TokenResult.VALID, codec.validate("card_001", first.value))
  }

  @Test fun expiredAtBoundary() {
    val token = codec.issue("card_001")
    now = token.expiresAtEpochMs - 1
    assertEquals(TokenResult.VALID, codec.validate("card_001", token.value))
    now = token.expiresAtEpochMs
    assertEquals(TokenResult.TOKEN_EXPIRED, codec.validate("card_001", token.value))
  }

  @Test fun invalidSignatureCardAndFormat() {
    val token = codec.issue("card_001")
    assertEquals(TokenResult.TOKEN_INVALID, codec.validate("card_002", token.value))
    assertEquals(TokenResult.TOKEN_INVALID, codec.validate("card_001", token.value.dropLast(1) + "A"))
    assertEquals(TokenResult.TOKEN_INVALID, codec.validate("card_001", "broken"))
    assertEquals(TokenResult.TOKEN_INVALID, codec.validate("card_001", "x".repeat(600)))
  }
}
