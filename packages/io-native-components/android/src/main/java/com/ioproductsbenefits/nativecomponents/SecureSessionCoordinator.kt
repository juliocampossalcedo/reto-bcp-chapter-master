package com.ioproductsbenefits.nativecomponents

import android.os.SystemClock

interface SecureEvents {
  fun opened(cardId: String)
  fun validationError(code: String, message: String)
  fun shown(cardId: String)
  fun closed(cardId: String, reason: String)
}

data class SecureSession(
  val cardId: String,
  val token: String,
  val deadlineElapsedMs: Long,
  val events: SecureEvents,
  var opened: Boolean = false,
  var shown: Boolean = false,
  var closed: Boolean = false,
  var revealAllowed: Boolean = false,
)

object SecureSessionCoordinator {
  private var current: SecureSession? = null
  @Synchronized fun begin(cardId: String, token: String, events: SecureEvents, nowElapsedMs: Long = SystemClock.elapsedRealtime()): Boolean {
    if (current != null) return false
    current = SecureSession(cardId, token, nowElapsedMs + 45_000L, events)
    return true
  }
  @Synchronized fun active(): SecureSession? = current?.takeUnless { it.closed }
  @Synchronized fun isExpired(session: SecureSession, nowElapsedMs: Long = SystemClock.elapsedRealtime()): Boolean =
    nowElapsedMs >= session.deadlineElapsedMs
  @Synchronized fun open(session: SecureSession) {
    if (current !== session || session.closed || session.opened) return
    session.opened = true
    session.events.opened(session.cardId)
  }
  @Synchronized fun hide(session: SecureSession) {
    if (current === session && !session.closed) session.revealAllowed = false
  }
  @Synchronized fun allowReveal(session: SecureSession, nowElapsedMs: Long = SystemClock.elapsedRealtime()): Boolean {
    if (current !== session || session.closed || !session.opened || isExpired(session, nowElapsedMs)) return false
    session.revealAllowed = true
    return true
  }
  @Synchronized fun validationError(session: SecureSession, code: String, message: String) {
    if (current !== session || session.closed || !session.opened) return
    session.revealAllowed = false
    session.events.validationError(code, message)
  }
  @Synchronized fun shown(session: SecureSession, nowElapsedMs: Long = SystemClock.elapsedRealtime()): Boolean {
    if (current !== session || session.closed || !session.opened || !session.revealAllowed || session.shown || isExpired(session, nowElapsedMs)) return false
    session.shown = true
    session.events.shown(session.cardId)
    return true
  }
  @Synchronized fun close(session: SecureSession, reason: String) {
    if (current !== session || session.closed) return
    session.closed = true
    session.revealAllowed = false
    current = null
    if (session.opened) session.events.closed(session.cardId, reason)
  }
  @Synchronized fun abandon() { current = null }
}
