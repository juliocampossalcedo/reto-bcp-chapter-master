import type { CardBrand } from '../../../../shared/domain/CardBrand';

export interface AvailableCardBrandsReader {
  getAvailableBrands(): Promise<readonly CardBrand[]>;
}
