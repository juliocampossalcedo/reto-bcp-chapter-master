import React from 'react';
import { StyleSheet } from 'react-native';
import NativeMap from './specs/CustomMapNativeComponent';

// Structural API: app contracts stay independent of the library and Codegen.
export interface CustomMapProps {
  readonly markers: readonly {
    readonly id: string;
    readonly latitude: number;
    readonly longitude: number;
    readonly title?: string;
  }[];
  readonly selectedMarkerId?: string | null;
  readonly onMarkerPress: (markerId: string) => void;
}
export type MapStatus = 'loaded' | 'unavailable';
export function CustomMap({
  markers,
  selectedMarkerId,
  onMarkerPress,
  onStatus,
}: CustomMapProps & {
  readonly onStatus?: (status: MapStatus) => void;
}): React.JSX.Element {
  const ids = new Set(markers.map(m => m.id));
  return (
    <NativeMap
      style={styles.map}
      accessibilityLabel="Mapa de beneficios"
      markers={markers.map(m => ({
        id: m.id,
        latitude: m.latitude,
        longitude: m.longitude,
        ...(m.title === undefined ? {} : { title: m.title }),
      }))}
      selectedMarkerId={selectedMarkerId ?? undefined}
      onMarkerPress={event => {
        const id = event.nativeEvent.markerId;
        if (typeof id === 'string' && id.length > 0 && ids.has(id)) {
          onMarkerPress(id);
        }
      }}
      onMapStatus={event => {
        const status = event.nativeEvent.status;
        if (status === 'loaded' || status === 'unavailable') {
          onStatus?.(status);
        }
      }}
    />
  );
}
const styles = StyleSheet.create({ map: { flex: 1, minHeight: 180 } });
