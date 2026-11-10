import type { ViewProps, CodegenTypes } from 'react-native';
import { codegenNativeComponent } from 'react-native';

type NativeMarker = Readonly<{
  id: string;
  latitude: CodegenTypes.Double;
  longitude: CodegenTypes.Double;
  title?: string;
}>;
interface NativeProps extends ViewProps {
  markers: ReadonlyArray<NativeMarker>;
  selectedMarkerId?: string;
  onMarkerPress?: CodegenTypes.DirectEventHandler<
    Readonly<{ markerId: string }>
  >;
  onMapStatus?: CodegenTypes.DirectEventHandler<Readonly<{ status: string }>>;
}
export default codegenNativeComponent<NativeProps>('CustomMap');
