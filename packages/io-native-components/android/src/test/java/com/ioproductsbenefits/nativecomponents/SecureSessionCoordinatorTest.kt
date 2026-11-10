package com.ioproductsbenefits.nativecomponents

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SecureSessionCoordinatorTest {
  @Test fun oneActiveSessionAndSingleClose() {
    SecureSessionCoordinator.abandon()
    val closedEvents = mutableListOf<String>()
    val events = object : SecureEvents {
      override fun opened(cardId: String) {}
      override fun validationError(code: String, message: String) {}
      override fun shown(cardId: String) {}
      override fun closed(cardId: String, reason: String) { closedEvents.add("$cardId:$reason") }
    }
    assertTrue(SecureSessionCoordinator.begin("card_001", "opaque", events, 100L))
    assertFalse(SecureSessionCoordinator.begin("card_002", "opaque", events, 100L))
    val session = SecureSessionCoordinator.active()!!
    assertEquals(45_100L, session.deadlineElapsedMs)
    SecureSessionCoordinator.open(session)
    SecureSessionCoordinator.close(session, "USER_DISMISS")
    SecureSessionCoordinator.close(session, "TIMEOUT")
    assertEquals(listOf("card_001:USER_DISMISS"), closedEvents)
    assertEquals(null, SecureSessionCoordinator.active())
  }

  @Test fun timeoutClosesOnlyTheOpenedSessionAndFreesTheNextOne() {
    SecureSessionCoordinator.abandon()
    val closedEvents = mutableListOf<Pair<String, String>>()
    val events = object : SecureEvents {
      override fun opened(cardId: String) {}
      override fun validationError(code: String, message: String) {}
      override fun shown(cardId: String) {}
      override fun closed(cardId: String, reason: String) { closedEvents.add(cardId to reason) }
    }

    assertTrue(SecureSessionCoordinator.begin("card_001", "opaque", events, 5_000L))
    val first = SecureSessionCoordinator.active()!!
    assertFalse(SecureSessionCoordinator.begin("card_002", "other", events, 5_001L))
    SecureSessionCoordinator.open(first)
    assertEquals(50_000L, first.deadlineElapsedMs)
    SecureSessionCoordinator.close(first, "TIMEOUT")
    SecureSessionCoordinator.close(first, "USER_DISMISS")
    assertEquals(listOf("card_001" to "TIMEOUT"), closedEvents)

    assertTrue(SecureSessionCoordinator.begin("card_002", "other", events, 50_000L))
    val second = SecureSessionCoordinator.active()!!
    SecureSessionCoordinator.close(second, "USER_DISMISS")
    assertEquals(listOf("card_001" to "TIMEOUT"), closedEvents)
    assertEquals(null, SecureSessionCoordinator.active())
  }

  @Test fun invalidValidationNeverShowsAndClosesOnlyAfterDismiss() {
    SecureSessionCoordinator.abandon()
    val received = mutableListOf<String>()
    val events = object : SecureEvents {
      override fun opened(cardId: String) { received.add("Opened:$cardId") }
      override fun validationError(code: String, message: String) { received.add("Error:$code:$message") }
      override fun shown(cardId: String) { received.add("Shown:$cardId") }
      override fun closed(cardId: String, reason: String) { received.add("Closed:$cardId:$reason") }
    }
    assertTrue(SecureSessionCoordinator.begin("card_001", "opaque-sentinel", events, 100L))
    val session = SecureSessionCoordinator.active()!!
    SecureSessionCoordinator.open(session)
    SecureSessionCoordinator.validationError(session, "TOKEN_INVALID", "Acceso no válido")
    assertFalse(SecureSessionCoordinator.shown(session, 101L))
    assertEquals(listOf("Opened:card_001", "Error:TOKEN_INVALID:Acceso no válido"), received)
    SecureSessionCoordinator.close(session, "USER_DISMISS")
    SecureSessionCoordinator.validationError(session, "TOKEN_INVALID", "Acceso no válido")
    assertFalse(SecureSessionCoordinator.shown(session, 102L))
    assertEquals(listOf("Opened:card_001", "Error:TOKEN_INVALID:Acceso no válido", "Closed:card_001:USER_DISMISS"), received)
    assertFalse(received.joinToString().contains("opaque-sentinel"))
  }

  @Test fun backgroundHidesAndReentryRequiresNewValidationBeforeDraw() {
    SecureSessionCoordinator.abandon()
    val received = mutableListOf<String>()
    val events = object : SecureEvents {
      override fun opened(cardId: String) { received.add("Opened") }
      override fun validationError(code: String, message: String) { received.add("Error:$code") }
      override fun shown(cardId: String) { received.add("Shown") }
      override fun closed(cardId: String, reason: String) { received.add("Closed:$reason") }
    }
    assertTrue(SecureSessionCoordinator.begin("card_001", "opaque", events, 100L))
    val session = SecureSessionCoordinator.active()!!
    SecureSessionCoordinator.open(session)
    assertTrue(SecureSessionCoordinator.allowReveal(session, 101L))
    assertTrue(SecureSessionCoordinator.shown(session, 102L))
    SecureSessionCoordinator.hide(session) // onPause/onStop
    assertFalse(SecureSessionCoordinator.shown(session, 103L))
    assertTrue(SecureSessionCoordinator.allowReveal(session, 45_099L)) // revalidated onResume
    assertFalse(SecureSessionCoordinator.shown(session, 45_099L)) // no duplicate Shown
    SecureSessionCoordinator.hide(session)
    assertTrue(SecureSessionCoordinator.isExpired(session, 45_100L))
    assertFalse(SecureSessionCoordinator.allowReveal(session, 45_100L))
    SecureSessionCoordinator.close(session, "TIMEOUT")
    assertEquals(listOf("Opened", "Shown", "Closed:TIMEOUT"), received)
  }

  @Test fun closeWinsRaceAgainstLateDrawAndErrorCallbacks() {
    SecureSessionCoordinator.abandon()
    val received = mutableListOf<String>()
    val events = object : SecureEvents {
      override fun opened(cardId: String) { received.add("Opened") }
      override fun validationError(code: String, message: String) { received.add("Error") }
      override fun shown(cardId: String) { received.add("Shown") }
      override fun closed(cardId: String, reason: String) { received.add("Closed:$reason") }
    }
    assertTrue(SecureSessionCoordinator.begin("card_001", "opaque", events, 100L))
    val session = SecureSessionCoordinator.active()!!
    SecureSessionCoordinator.open(session)
    assertTrue(SecureSessionCoordinator.allowReveal(session, 101L))
    SecureSessionCoordinator.close(session, "USER_DISMISS")
    assertFalse(SecureSessionCoordinator.shown(session, 102L))
    SecureSessionCoordinator.validationError(session, "TOKEN_INVALID", "Acceso no válido")
    SecureSessionCoordinator.close(session, "TIMEOUT")
    assertEquals(listOf("Opened", "Closed:USER_DISMISS"), received)
  }
}
