import type { Benefit } from '../../domain/models/Benefit';
import type { BenefitRepository } from '../../domain/repositories/BenefitRepository';
import type { AvailableCardBrandsReader } from '../ports/AvailableCardBrandsReader';

export function validCoordinates(
  latitude: unknown,
  longitude: unknown,
): boolean {
  return (
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    Math.abs(latitude) <= 90 &&
    typeof longitude === 'number' &&
    Number.isFinite(longitude) &&
    Math.abs(longitude) <= 180
  );
}

export interface EligibleBenefits {
  readonly benefits: readonly Benefit[];
  readonly omittedLocations: number;
}

export async function loadEligibleBenefits(
  repository: BenefitRepository,
  reader: AvailableCardBrandsReader,
): Promise<EligibleBenefits> {
  const [benefits, brands] = await Promise.all([
    repository.listBenefits(),
    reader.getAvailableBrands(),
  ]);
  const available = new Set(
    brands.map(b => b.trim().toUpperCase()).filter(Boolean),
  );
  const eligible = benefits.filter(b =>
    b.applicableBrands.some(brand => available.has(brand.trim().toUpperCase())),
  );
  const located = eligible.filter(b =>
    validCoordinates(b.latitude, b.longitude),
  );
  if (eligible.length > 0 && located.length === 0) {
    throw new Error('Ubicaciones de beneficios inválidas');
  }
  return {
    benefits: located,
    omittedLocations: eligible.length - located.length,
  };
}
