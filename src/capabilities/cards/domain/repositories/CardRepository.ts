import type { Card } from '../models/Card';

export interface CardRepository {
  listCards(): Promise<readonly Card[]>;
}
