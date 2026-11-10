package com.ioproductsbenefits.nativecomponents

import android.app.Activity
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.view.Gravity
import android.view.View
import android.view.ViewTreeObserver
import android.view.WindowManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

class CardSecureActivity : Activity() {
  companion object { internal var codec: TokenCodec? = null }
  private val handler = Handler(Looper.getMainLooper())
  private var session: SecureSession? = null
  private lateinit var root: LinearLayout
  private lateinit var status: TextView
  private lateinit var details: LinearLayout
  private val sensitiveFields = ArrayList<TextView>()
  private var drawListener: ViewTreeObserver.OnDrawListener? = null
  private val timeout = Runnable { finishSecure("TIMEOUT") }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
    window.setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN)
    session = SecureSessionCoordinator.active()
    if (session == null || codec == null) { finish(); return }
    buildUi()
    val active = session ?: return
    SecureSessionCoordinator.open(active)
    handler.postDelayed(timeout, (active.deadlineElapsedMs - SystemClock.elapsedRealtime()).coerceAtLeast(0L))
  }

  private fun buildUi() {
    root = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER_VERTICAL
      setPadding(32.dp(), 32.dp(), 32.dp(), 32.dp())
      setBackgroundColor(0xFFF4F6FB.toInt())
    }
    root.addView(TextView(this).apply { text = "Datos de tu tarjeta"; textSize = 28f; setTextColor(0xFF102748.toInt()) })
    status = TextView(this).apply { text = "Validando acceso…"; textSize = 17f; setTextColor(0xFF445B79.toInt()); setPadding(0, 20.dp(), 0, 20.dp()) }
    root.addView(status)
    details = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      visibility = View.GONE
      setPadding(24.dp(), 24.dp(), 24.dp(), 24.dp())
      setBackgroundColor(0xFF163D75.toInt())
    }
    root.addView(details)
    root.addView(Button(this).apply {
      text = "Ocultar"
      contentDescription = "Ocultar datos de tarjeta"
      minHeight = 48.dp()
      setOnClickListener { finishSecure("USER_DISMISS") }
    })
    setContentView(root)
  }

  override fun onResume() {
    super.onResume()
    val active = session ?: return
    if (active.closed) { finish(); return }
    if (SecureSessionCoordinator.isExpired(active)) { finishSecure("TIMEOUT"); return }
    hideDetails()
    when (codec?.validate(active.cardId, active.token)) {
      TokenResult.VALID -> reveal(active)
      TokenResult.TOKEN_EXPIRED -> error(active, "TOKEN_EXPIRED", "La autorización venció. Vuelve a solicitarla.")
      else -> error(active, "TOKEN_INVALID", "No se pudo validar el acceso. Vuelve a intentarlo.")
    }
  }

  private fun reveal(active: SecureSession) {
    if (active.closed || SecureSessionCoordinator.isExpired(active)) { finishSecure("TIMEOUT"); return }
    val card = NativeMockCardRepository.get(active.cardId) ?: run {
      error(active, "TOKEN_INVALID", "No se pudo validar el acceso. Vuelve a intentarlo."); return
    }
    if (!SecureSessionCoordinator.allowReveal(active)) { finishSecure("TIMEOUT"); return }
    status.text = "Información temporal. Se ocultará automáticamente."
    for (value in listOf("Número de tarjeta" to card.pan, "CVV" to card.cvv, "Vencimiento" to card.expiry, "Titular" to card.holder)) {
      val field = TextView(this).apply {
        text = "${value.first}: ${value.second}"
        textSize = 18f
        setTextColor(0xFFFFFFFF.toInt())
        setPadding(0, 10.dp(), 0, 10.dp())
      }
      sensitiveFields.add(field)
      details.addView(field)
    }
    details.visibility = View.VISIBLE
    if (!active.shown) {
      val observer = object : ViewTreeObserver.OnDrawListener {
        override fun onDraw() {
          details.post {
            removeDrawListener()
            if (details.visibility == View.VISIBLE) SecureSessionCoordinator.shown(active)
          }
        }
      }
      drawListener = observer
      details.viewTreeObserver.addOnDrawListener(observer)
    }
  }

  private fun error(active: SecureSession, code: String, message: String) {
    hideDetails()
    status.text = message
    SecureSessionCoordinator.validationError(active, code, message)
  }

  private fun hideDetails() {
    session?.let { SecureSessionCoordinator.hide(it) }
    removeDrawListener()
    details.visibility = View.GONE
    sensitiveFields.forEach { it.text = "" }
    sensitiveFields.clear()
    details.removeAllViews()
  }

  private fun removeDrawListener() {
    val listener = drawListener ?: return
    drawListener = null
    if (details.viewTreeObserver.isAlive) details.viewTreeObserver.removeOnDrawListener(listener)
  }

  override fun onPause() {
    if (::details.isInitialized) hideDetails()
    super.onPause()
  }

  override fun onStop() {
    if (::details.isInitialized) hideDetails()
    super.onStop()
  }

  private fun finishSecure(reason: String) {
    val active = session ?: return
    if (active.closed) return
    if (::details.isInitialized) hideDetails()
    handler.removeCallbacks(timeout)
    SecureSessionCoordinator.close(active, if (SecureSessionCoordinator.isExpired(active)) "TIMEOUT" else reason)
    finish()
  }

  @Deprecated("Use secure close semantics")
  override fun onBackPressed() { finishSecure("USER_DISMISS") }

  override fun onDestroy() {
    handler.removeCallbacks(timeout)
    if (::details.isInitialized) hideDetails()
    if (!isChangingConfigurations) session?.let {
      if (!it.closed) {
        val reason = if (SecureSessionCoordinator.isExpired(it)) "TIMEOUT" else "USER_DISMISS"
        SecureSessionCoordinator.close(it, reason)
      }
    }
    super.onDestroy()
  }

  private fun Int.dp(): Int = (this * resources.displayMetrics.density).toInt()
}
