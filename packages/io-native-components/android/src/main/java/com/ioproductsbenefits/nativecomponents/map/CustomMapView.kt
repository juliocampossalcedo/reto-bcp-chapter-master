package com.ioproductsbenefits.nativecomponents.map

import android.content.ComponentCallbacks2
import android.content.res.Configuration
import android.content.pm.PackageManager
import android.os.Bundle
import android.view.View.MeasureSpec
import android.widget.FrameLayout
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.savedstate.SavedStateRegistryOwner
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableType
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.MapView
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.LatLngBounds
import com.google.android.gms.maps.model.Marker
import com.google.android.gms.maps.model.MarkerOptions
import java.util.UUID

class CustomMapView(private val reactContext: ThemedReactContext) : FrameLayout(reactContext), DefaultLifecycleObserver, ComponentCallbacks2 {
  private val state = MapState()
  private var mapView: MapView? = null
  private var map: GoogleMap? = null
  private val pins = mutableMapOf<String, Marker>()
  private var points = emptyList<MapPoint>()
  private var cameraPoints = emptyList<Pair<Double, Double>>()
  private var destroyed = false
  private val unavailable = Runnable { if (!destroyed) emit("topMapStatus", "status", "unavailable") }
  private val layoutMap = Runnable {
    if (!destroyed && isAttachedToWindow && width > 0 && height > 0) {
      layoutMapContent(width, height)
      fitCamera()
    }
  }
  private var resumed = false
  private var visible = false
  private var owner: LifecycleOwner? = null
  private var savedOwner: SavedStateRegistryOwner? = null
  private val savedKey = "io.custommap.${UUID.randomUUID()}"
  private var savedBundle = Bundle()
  private val lifecycle = MapLifecycle { action ->
    mapView?.let { view -> when (action) {
      "start" -> view.onStart()
      "resume" -> view.onResume()
      "pause" -> view.onPause()
      "stop" -> view.onStop()
      "lowMemory" -> view.onLowMemory()
      "save" -> view.onSaveInstanceState(savedBundle)
      "destroy" -> view.onDestroy()
    } }
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    if (destroyed) return
    if (mapView == null) initialize()
    requestLayout()
    syncActive()
  }
  private fun initialize() {
    val metadata = reactContext.packageManager.getApplicationInfo(reactContext.packageName, PackageManager.GET_META_DATA).metaData
    val key = metadata?.getString("com.google.android.geo.API_KEY")
    if (key.isNullOrBlank() || key == "DEFAULT_API_KEY" ||
      GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(reactContext) != ConnectionResult.SUCCESS) {
      post(unavailable)
      return
    }
    try {
      val view = MapView(reactContext)
      mapView = view
      addView(view, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
      // Each Fabric instance recreates camera/markers from current props after host recreation.
      // Registry captures SDK state for the current instance; UUID intentionally avoids stale restoration.
      savedOwner = reactContext.currentActivity as? SavedStateRegistryOwner
      view.onCreate(null)
      savedOwner?.savedStateRegistry?.registerSavedStateProvider(savedKey) {
        savedBundle = Bundle(); lifecycle.save(); savedBundle
      }
      reactContext.applicationContext.registerComponentCallbacks(this)
      owner = reactContext.currentActivity as? LifecycleOwner
      owner?.lifecycle?.addObserver(this)
      resumed = owner?.lifecycle?.currentState?.isAtLeast(Lifecycle.State.RESUMED) == true
      view.getMapAsync { google ->
        if (destroyed) return@getMapAsync
        map = google
        google.uiSettings.isMapToolbarEnabled = false
        google.uiSettings.isZoomControlsEnabled = true
        requestLayout()
        google.setOnMarkerClickListener { pin ->
          state.tap(pin.tag as? String, resumed && visible && isAttachedToWindow)?.let { emit("topMarkerPress", "markerId", it) }
          true
        }
        google.setOnMapLoadedCallback { if (!destroyed) emit("topMapStatus", "status", "loaded") }
        state.ready(object : MapRenderer {
          override fun upsert(point: MapPoint) {
            val position = LatLng(point.latitude, point.longitude)
            val pin = pins[point.id]
            if (pin == null) {
              google.addMarker(MarkerOptions().position(position).title(point.title))?.let {
                it.tag = point.id; pins[point.id] = it
              }
            } else { pin.position = position; pin.title = point.title }
          }
          override fun remove(id: String) { pins.remove(id)?.remove() }
          override fun select(id: String?) {
            pins.forEach { (key, pin) ->
              pin.setIcon(BitmapDescriptorFactory.defaultMarker(if (key == id) BitmapDescriptorFactory.HUE_AZURE else BitmapDescriptorFactory.HUE_RED))
              pin.zIndex = if (key == id) 1f else 0f
              if (key == id) pin.showInfoWindow() else pin.hideInfoWindow()
            }
          }
          override fun dispose() {
            google.setOnMarkerClickListener(null); google.setOnMapLoadedCallback(null)
            pins.values.forEach { it.remove() }; pins.clear()
          }
        })
        fitCamera()
      }
    } catch (_: RuntimeException) {
      // SDK failure is explicit; never emit the key or exception payload to JS.
      post(unavailable)
    }
  }
  fun setMarkers(input: ReadableArray?) {
    if (destroyed) return
    val parsed = mutableListOf<MapPoint>()
    if (input != null) for (i in 0 until input.size()) {
      if (input.getType(i) != ReadableType.Map) continue
      val r = input.getMap(i) ?: continue
      if (!r.hasKey("id") || r.getType("id") != ReadableType.String ||
        !r.hasKey("latitude") || r.getType("latitude") != ReadableType.Number ||
        !r.hasKey("longitude") || r.getType("longitude") != ReadableType.Number) continue
      val title = if (r.hasKey("title") && r.getType("title") == ReadableType.String) r.getString("title") else null
      parsed.add(MapPoint(r.getString("id") ?: "", r.getDouble("latitude"), r.getDouble("longitude"), title))
    }
    points = parsed.filter { it.valid() }.distinctBy { it.id }
    state.update(points); fitCamera()
  }
  fun setSelection(id: String?) { state.select(id) }
  private fun fitCamera() {
    val google = map ?: return
    if (destroyed || !resumed || !visible || width <= 0 || height <= 0 || points.isEmpty()) return
    val locations = points.map { it.latitude to it.longitude }
    if (locations == cameraPoints) return
    cameraPoints = locations
    if (points.size == 1) {
      google.moveCamera(CameraUpdateFactory.newLatLngZoom(LatLng(points[0].latitude, points[0].longitude), 14f))
    } else {
      val bounds = LatLngBounds.builder()
      points.forEach { bounds.include(LatLng(it.latitude, it.longitude)) }
      google.moveCamera(CameraUpdateFactory.newLatLngBounds(bounds.build(), width, height, (32 * resources.displayMetrics.density).toInt().coerceAtMost(minOf(width, height) / 4)))
    }
  }
  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
    super.onLayout(changed, l, t, r, b)
    layoutMapContent(r - l, b - t)
    fitCamera()
  }
  private fun layoutMapContent(contentWidth: Int, contentHeight: Int) {
    if (destroyed || contentWidth <= 0 || contentHeight <= 0) return
    mapView?.let { view ->
      view.measure(
        MeasureSpec.makeMeasureSpec(contentWidth, MeasureSpec.EXACTLY),
        MeasureSpec.makeMeasureSpec(contentHeight, MeasureSpec.EXACTLY),
      )
      view.layout(0, 0, contentWidth, contentHeight)
    }
  }
  override fun requestLayout() {
    super.requestLayout()
    // Fabric owns the outer layout; SDK children can request layout asynchronously.
    // Coalesce their requests into an exact measure/layout of the native child.
    if (!destroyed && mapView != null) {
      removeCallbacks(layoutMap)
      post(layoutMap)
    }
  }
  override fun onVisibilityAggregated(isVisible: Boolean) {
    super.onVisibilityAggregated(isVisible); visible = isVisible; syncActive()
  }
  private fun syncActive() { lifecycle.active(resumed && visible && isAttachedToWindow); fitCamera() }
  override fun onResume(owner: LifecycleOwner) { resumed = true; syncActive() }
  override fun onPause(owner: LifecycleOwner) { resumed = false; syncActive() }
  override fun onStop(owner: LifecycleOwner) { resumed = false; syncActive() }
  override fun onDestroy(owner: LifecycleOwner) { destroy() }
  override fun onDetachedFromWindow() { removeCallbacks(layoutMap); lifecycle.active(false); super.onDetachedFromWindow() }
  override fun onLowMemory() { lifecycle.lowMemory() }
  override fun onTrimMemory(level: Int) { if (level >= ComponentCallbacks2.TRIM_MEMORY_RUNNING_LOW) lifecycle.lowMemory() }
  override fun onConfigurationChanged(newConfig: Configuration) { requestLayout() }
  fun destroy() {
    if (destroyed) return
    destroyed = true
    removeCallbacks(unavailable)
    removeCallbacks(layoutMap)
    state.destroy(); lifecycle.destroy()
    owner?.lifecycle?.removeObserver(this); owner = null
    savedOwner?.savedStateRegistry?.unregisterSavedStateProvider(savedKey); savedOwner = null
    reactContext.applicationContext.unregisterComponentCallbacks(this)
    removeAllViews(); map = null; mapView = null; points = emptyList(); cameraPoints = emptyList()
  }
  private fun emit(name: String, key: String, value: String) {
    if (destroyed) return
    UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)?.dispatchEvent(
      MapViewEvent(UIManagerHelper.getSurfaceId(this), id, name, key, value)
    )
  }
}
private class MapViewEvent(surface: Int, tag: Int, private val name: String, private val key: String, private val value: String) : Event<MapViewEvent>(surface, tag) {
  override fun getEventName() = name
  override fun canCoalesce() = false
  override fun getEventData() = Arguments.createMap().apply { putString(key, value) }
}
