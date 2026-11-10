package com.ioproductsbenefits.nativecomponents

import android.util.Base64
import java.nio.ByteBuffer
import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.security.SecureRandom
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

enum class TokenResult { VALID, TOKEN_INVALID, TOKEN_EXPIRED }
data class IssuedToken(val value: String, val expiresAtEpochMs: Long)

class TokenCodec(
  private val clock: () -> Long = System::currentTimeMillis,
  private val random: SecureRandom = SecureRandom(),
  secret: ByteArray? = null,
  private val encode: (ByteArray) -> String = { Base64.encodeToString(it, Base64.URL_SAFE or Base64.NO_PADDING or Base64.NO_WRAP) },
  private val decode: (String) -> ByteArray = { Base64.decode(it, Base64.URL_SAFE or Base64.NO_PADDING or Base64.NO_WRAP) },
) {
  companion object { const val TTL_MS = 60_000L; private const val MAX_TOKEN = 512 }
  private val key = (secret?.clone() ?: ByteArray(32).also { random.nextBytes(it) })

  fun issue(cardId: String): IssuedToken {
    require(NativeMockCardRepository.contains(cardId)) { "Tarjeta no disponible" }
    val issued = clock()
    val nonce = ByteArray(16).also { random.nextBytes(it) }
    val idBytes = cardId.toByteArray(StandardCharsets.UTF_8)
    val payload = ByteBuffer.allocate(4 + idBytes.size + 8 + 8 + 16)
      .putInt(idBytes.size).put(idBytes).putLong(issued).putLong(issued + TTL_MS).put(nonce).array()
    val encoded = encode(payload)
    return IssuedToken("v1.$encoded.${encode(sign(payload))}", issued + TTL_MS)
  }

  fun validate(cardId: String, token: String): TokenResult {
    if (token.length > MAX_TOKEN || !token.startsWith("v1.")) return TokenResult.TOKEN_INVALID
    val parts = token.split('.')
    if (parts.size != 3 || parts.any { it.isEmpty() }) return TokenResult.TOKEN_INVALID
    return try {
      val payload = decode(parts[1])
      val mac = decode(parts[2])
      if (encode(payload) != parts[1] || encode(mac) != parts[2]) return TokenResult.TOKEN_INVALID
      if (mac.size != 32 || !MessageDigest.isEqual(sign(payload), mac)) return TokenResult.TOKEN_INVALID
      val buffer = ByteBuffer.wrap(payload)
      val idLength = buffer.int
      if (idLength !in 1..80 || payload.size != 4 + idLength + 8 + 8 + 16) return TokenResult.TOKEN_INVALID
      val id = ByteArray(idLength).also { buffer.get(it) }.toString(StandardCharsets.UTF_8)
      val issued = buffer.long
      val expiry = buffer.long
      if (id != cardId || !NativeMockCardRepository.contains(id) || expiry - issued != TTL_MS) return TokenResult.TOKEN_INVALID
      val now = clock()
      if (now < issued) TokenResult.TOKEN_INVALID else if (now >= expiry) TokenResult.TOKEN_EXPIRED else TokenResult.VALID
    } catch (_: Exception) { TokenResult.TOKEN_INVALID }
  }

  private fun sign(payload: ByteArray): ByteArray = Mac.getInstance("HmacSHA256").run {
    init(SecretKeySpec(key, "HmacSHA256"))
    doFinal(payload)
  }
}
