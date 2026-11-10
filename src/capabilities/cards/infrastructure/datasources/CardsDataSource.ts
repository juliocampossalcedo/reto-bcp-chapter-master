import type { Card } from '../../domain/models/Card';

/** Contrato seguro de datos de entrada ya depurados para la app RN. */
export type CardRecord = Readonly<Card>;

export interface CardsDataSource {
  readCards(): Promise<readonly CardRecord[]>;
}
