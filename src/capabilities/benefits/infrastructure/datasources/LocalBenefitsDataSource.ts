import type { BenefitRecord, BenefitsDataSource } from './BenefitsDataSource';
import benefits from '../mocks/benefits.json';

function text(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Structural errors fail the dataset; invalid numeric locations are handled by the use case. */
export class LocalBenefitsDataSource implements BenefitsDataSource {
  constructor(private readonly records: unknown = benefits) {}

  async readBenefits(): Promise<readonly BenefitRecord[]> {
    if (!Array.isArray(this.records)) {
      throw new Error('Datos de beneficios inválidos');
    }
    const seen = new Set<number>();
    return this.records.map((input: unknown): BenefitRecord => {
      if (typeof input !== 'object' || input === null || Array.isArray(input)) {
        throw new Error('Datos de beneficios inválidos');
      }
      const r = input as Record<string, unknown>;
      if (
        typeof r.id !== 'number' ||
        !Number.isSafeInteger(r.id) ||
        r.id <= 0 ||
        seen.has(r.id) ||
        !text(r.title) ||
        !text(r.description) ||
        !text(r.promotion) ||
        !text(r.address) ||
        typeof r.image !== 'string' ||
        typeof r.latitude !== 'number' ||
        typeof r.longitude !== 'number' ||
        !Array.isArray(r.applicableBrands) ||
        !r.applicableBrands.every(text)
      ) {
        throw new Error('Datos de beneficios inválidos');
      }
      seen.add(r.id);
      return {
        id: r.id,
        title: r.title.trim(),
        description: r.description.trim(),
        image: r.image,
        promotion: r.promotion.trim(),
        address: r.address.trim(),
        latitude: r.latitude,
        longitude: r.longitude,
        applicableBrands: [
          ...new Set(r.applicableBrands.map(b => b.trim().toUpperCase())),
        ],
      };
    });
  }
}
