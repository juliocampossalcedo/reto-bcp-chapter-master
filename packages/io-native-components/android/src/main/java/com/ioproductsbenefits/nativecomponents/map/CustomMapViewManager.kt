package com.ioproductsbenefits.nativecomponents.map

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.CustomMapManagerDelegate
import com.facebook.react.viewmanagers.CustomMapManagerInterface

class CustomMapViewManager : SimpleViewManager<CustomMapView>(), CustomMapManagerInterface<CustomMapView> {
  private val delegate = CustomMapManagerDelegate(this)
  override fun getName() = "CustomMap"
  override fun getDelegate(): ViewManagerDelegate<CustomMapView> = delegate
  override fun createViewInstance(context: ThemedReactContext) = CustomMapView(context)
  override fun setMarkers(view: CustomMapView, value: ReadableArray?) = view.setMarkers(value)
  override fun setSelectedMarkerId(view: CustomMapView, value: String?) = view.setSelection(value)
  override fun onDropViewInstance(view: CustomMapView) { view.destroy(); super.onDropViewInstance(view) }
  override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> = mutableMapOf(
    "topMarkerPress" to mapOf("registrationName" to "onMarkerPress"),
    "topMapStatus" to mapOf("registrationName" to "onMapStatus")
  )
}
