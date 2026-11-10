package com.ioproductsbenefits.nativecomponents.map

import org.junit.Assert.*
import org.junit.Test

class MapStateTest {
  private val a = MapPoint("a", -12.0, -77.0, "A")
  private class Renderer : MapRenderer {
    val points = mutableMapOf<String, MapPoint>()
    val updates = mutableListOf<String>()
    var selected: String? = null
    var disposed = 0
    override fun upsert(point: MapPoint) { points[point.id] = point; updates.add(point.id) }
    override fun remove(id: String) { points.remove(id) }
    override fun select(id: String?) { selected = id }
    override fun dispose() { disposed++; points.clear() }
  }
  @Test fun validatesCoordinatesAndIds() {
    assertTrue(a.copy(latitude = 90.0, longitude = -180.0).valid())
    assertTrue(a.copy(latitude = 0.0, longitude = 0.0).valid())
    listOf(a.copy(id = " "), a.copy(latitude = Double.NaN), a.copy(longitude = Double.POSITIVE_INFINITY), a.copy(latitude = -91.0), a.copy(longitude = 181.0)).forEach { assertFalse(it.valid()) }
  }
  @Test fun latestPreReadySnapshotAndSelection() {
    val state = MapState(); val renderer = Renderer()
    state.update(listOf(a)); state.update(listOf(a.copy(title = "Latest"))); state.select("a")
    assertNull(state.tap("a", true))
    state.ready(renderer)
    assertEquals("Latest", renderer.points["a"]?.title); assertEquals("a", renderer.selected)
    assertEquals("a", state.tap("a", true)); assertNull(state.tap("a", false))
  }
  @Test fun incrementalAddUpdateRemoveEmptyAndNoDuplicate() {
    val state = MapState(); val r = Renderer(); state.ready(r)
    state.update(listOf(a, a.copy(title = "duplicate"), a.copy(id = "bad", latitude = Double.NaN)))
    assertEquals(1, r.points.size); assertEquals("A", r.points["a"]?.title)
    state.update(listOf(a)); assertEquals(1, r.updates.size)
    state.update(listOf(a.copy(latitude = -13.0), a.copy(id = "b")))
    assertEquals(3, r.updates.size)
    state.select("b"); assertEquals("b", r.selected)
    state.update(listOf(a)); assertNull(r.selected); assertNull(state.tap("b", true))
    state.select("unknown"); assertNull(r.selected)
    state.select(null); assertNull(r.selected)
    state.update(emptyList()); assertTrue(r.points.isEmpty())
  }
  @Test fun selectionDoesNotEmitTapAndCleanupIsIdempotent() {
    val state = MapState(); val r = Renderer(); state.ready(r); state.update(listOf(a)); state.select("a")
    state.destroy(); state.destroy(); state.update(listOf(a)); state.select("a")
    assertEquals(1, r.disposed); assertNull(state.tap("a", true))
    val late = Renderer(); state.ready(late); assertEquals(1, late.disposed); assertTrue(late.points.isEmpty())
  }
  @Test fun lifecyclePairsVisibilityBackgroundMemorySaveAndDestroy() {
    val calls = mutableListOf<String>(); val life = MapLifecycle { calls.add(it) }
    life.active(true); life.active(true); life.lowMemory(); life.save(); life.active(false); life.active(false)
    life.active(true); life.destroy(); life.destroy(); life.active(true); life.lowMemory(); life.save()
    assertEquals(listOf("start", "resume", "lowMemory", "save", "pause", "stop", "start", "resume", "pause", "stop", "destroy"), calls)
  }
}
