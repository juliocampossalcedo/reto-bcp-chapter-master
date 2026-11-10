import type { BenefitRepository } from '../../domain/repositories/BenefitRepository';
import type { BenefitsDataSource } from '../datasources/BenefitsDataSource';

export class MockBenefitRepository implements BenefitRepository {
  constructor(private readonly source: BenefitsDataSource) {}
  listBenefits() {
    return this.source.readBenefits();
  }
}
