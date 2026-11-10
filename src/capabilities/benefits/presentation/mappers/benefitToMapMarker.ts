import type { Benefit } from '../../domain/models/Benefit';
import type { MapMarker } from '../contracts/CustomMapContracts';

export function benefitToMapMarker(benefit: Benefit): MapMarker {
  return {
    id: String(benefit.id),
    latitude: benefit.latitude,
    longitude: benefit.longitude,
    title: benefit.title,
  };
}
