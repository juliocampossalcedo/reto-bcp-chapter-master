require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name = 'io-native-components'
  s.version = package['version']
  s.summary = 'React Native native components for the iO Products & Benefits app'
  s.description = 'Local Swift, UIKit, MapKit and Objective-C++ implementations for the existing Codegen package.'
  s.homepage = 'https://github.com/juliocampossalcedo/reto-bcp'
  s.license = { :type => 'Proprietary' }
  s.author = 'iO Products & Benefits'
  s.source = { :git => 'https://github.com/juliocampossalcedo/reto-bcp.git', :tag => s.version }
  s.platform = :ios, '15.1'
  s.module_name = 'IoNativeComponents'
  s.source_files = 'ios/**/*.{h,mm,swift}'
  s.public_header_files = 'ios/**/*.h'
  s.requires_arc = true
  s.swift_version = '5.0'
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++20'
  }

  install_modules_dependencies(s)
end
