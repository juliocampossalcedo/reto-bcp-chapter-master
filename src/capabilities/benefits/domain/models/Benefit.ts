import type { CardBrand } from '../../../../shared/domain/CardBrand';

export interface Benefit {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly image: string;
  readonly promotion: string;
  readonly address: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly applicableBrands: readonly CardBrand[];
}
