package com.ioproductsbenefits.nativecomponents

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class IoNativeComponentsPackage : BaseReactPackage() {
  override fun createViewManagers(reactContext: ReactApplicationContext): List<com.facebook.react.uimanager.ViewManager<*, *>> =
    listOf(com.ioproductsbenefits.nativecomponents.map.CustomMapViewManager())

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
    if (name == IoSecureViewModule.NAME) IoSecureViewModule(reactContext) else null

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider = ReactModuleInfoProvider {
    mapOf(IoSecureViewModule.NAME to ReactModuleInfo(IoSecureViewModule.NAME, IoSecureViewModule.NAME, false, false, false, true))
  }
}
