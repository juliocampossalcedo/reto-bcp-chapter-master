package com.ioproductsbenefits.nativecomponents

import android.content.Intent
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = IoSecureViewModule.NAME)
class IoSecureViewModule(private val reactContext: ReactApplicationContext) : NativeIoSecureViewSpec(reactContext) {
  companion object { const val NAME = "IoSecureView" }
  private val codec = TokenCodec()

  override fun getName(): String = NAME

  override fun issueSecureToken(cardId: String, promise: Promise) {
    try {
      val issued = codec.issue(cardId)
      val result = Arguments.createMap().apply {
        putString("value", issued.value)
        putDouble("expiresAtEpochMs", issued.expiresAtEpochMs.toDouble())
      }
      promise.resolve(result)
    } catch (_: Exception) { promise.reject("UNAVAILABLE", "No se pudo emitir la autorización") }
  }

  override fun openSecureView(cardId: String, secureToken: String, promise: Promise) {
    val activity = reactContext.currentActivity
    if (activity == null || !NativeMockCardRepository.contains(cardId)) {
      promise.reject("UNAVAILABLE", "Vista segura no disponible")
      return
    }
    val events = object : SecureEvents {
      override fun opened(id: String) { emitOnSecureViewOpened(Arguments.createMap().apply { putString("cardId", id) }) }
      override fun validationError(code: String, message: String) { emitOnValidationError(Arguments.createMap().apply { putString("code", code); putString("message", message) }) }
      override fun shown(id: String) { emitOnCardDataShown(Arguments.createMap().apply { putString("cardId", id) }) }
      override fun closed(id: String, reason: String) { emitOnSecureViewClosed(Arguments.createMap().apply { putString("cardId", id); putString("reason", reason) }) }
    }
    if (!SecureSessionCoordinator.begin(cardId, secureToken, events)) {
      promise.reject("BUSY", "Ya hay una vista segura abierta")
      return
    }
    activity.runOnUiThread {
      try {
        CardSecureActivity.codec = codec
        activity.startActivity(Intent(activity, CardSecureActivity::class.java))
        promise.resolve(true)
      } catch (_: Exception) {
        SecureSessionCoordinator.abandon()
        promise.reject("UNAVAILABLE", "No se pudo abrir la vista segura")
      }
    }
  }
}
