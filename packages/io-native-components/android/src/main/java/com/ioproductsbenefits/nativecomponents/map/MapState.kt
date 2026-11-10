package com.ioproductsbenefits.nativecomponents.map

// Pure seams used by the real SDK adapter, not a separate test implementation.
data class MapPoint(val id: String, val latitude: Double, val longitude: Double, val title: String?) {
  fun valid() = id.isNotBlank() && latitude.isFinite() && longitude.isFinite() &&
    latitude in -90.0..90.0 && longitude in -180.0..180.0
}
interface MapRenderer {
  fun upsert(point: MapPoint)
  fun remove(id: String)
  fun select(id: String?)
  fun dispose()
}
class MapState {
  private var points = emptyMap<String, MapPoint>()
  private var rendered = emptyMap<String, MapPoint>()
  private var renderer: MapRenderer? = null
  private var selected: String? = null
  private var destroyed = false
  fun update(input: List<MapPoint>) {
    if (destroyed) return
    // Invalid entries are dropped; first valid occurrence wins duplicate IDs.
    points = input.filter { it.valid() }.distinctBy { it.id }.associateBy { it.id }
    reconcile()
  }
  fun select(id: String?) { if (!destroyed) { selected = id; reconcile() } }
  fun ready(value: MapRenderer) {
    if (destroyed) { value.dispose(); return }
    renderer = value
    rendered = emptyMap()
    reconcile()
  }
  fun tap(id: String?, active: Boolean): String? =
    id?.takeIf { !destroyed && active && points.containsKey(it) && rendered.containsKey(it) }
  private fun reconcile() {
    val target = renderer ?: return
    (rendered.keys - points.keys).forEach { target.remove(it) }
    points.forEach { (id, point) -> if (rendered[id] != point) target.upsert(point) }
    target.select(selected?.takeIf { points.containsKey(it) })
    rendered = points
  }
  fun destroy() {
    if (destroyed) return
    destroyed = true
    renderer?.dispose()
    renderer = null
    points = emptyMap(); rendered = emptyMap(); selected = null
  }
}

/** Collapses visibility + host transitions into valid MapView start/resume/pause/stop pairs. */
class MapLifecycle(private val call: (String) -> Unit) {
  private var running = false
  private var destroyed = false
  fun active(value: Boolean) {
    if (destroyed || running == value) return
    running = value
    if (value) { call("start"); call("resume") } else { call("pause"); call("stop") }
  }
  fun lowMemory() { if (!destroyed) call("lowMemory") }
  fun save() { if (!destroyed) call("save") }
  fun destroy() {
    if (destroyed) return
    active(false); destroyed = true; call("destroy")
  }
}
