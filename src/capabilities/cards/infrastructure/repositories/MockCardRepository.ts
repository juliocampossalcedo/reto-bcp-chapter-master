import type { Card } from '../../domain/models/Card';
import type { CardRepository } from '../../domain/repositories/CardRepository';
import type { CardsDataSource } from '../datasources/CardsDataSource';

export class MockCardRepository implements CardRepository {
  constructor(private readonly dataSource: CardsDataSource) {}

  listCards(): Promise<readonly Card[]> {
    return this.dataSource.readCards();
  }
}
