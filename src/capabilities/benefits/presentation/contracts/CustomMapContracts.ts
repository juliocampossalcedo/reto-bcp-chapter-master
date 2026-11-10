export interface MapMarker {
  readonly id: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly title?: string;
}

/** API orientada a la app; no es todavía una spec de Codegen. */
export interface CustomMapProps {
  readonly markers: readonly MapMarker[];
  readonly selectedMarkerId?: string | null;
  readonly onMarkerPress: (markerId: string) => void;
}
