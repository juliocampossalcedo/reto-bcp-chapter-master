import type { CardBrand } from '../../../../shared/domain/CardBrand';

export interface Card {
  readonly cardId: string;
  readonly alias: string;
  readonly maskedPan: string;
  readonly brand: CardBrand;
  readonly expiry: string;
  readonly accountId: string;
}
