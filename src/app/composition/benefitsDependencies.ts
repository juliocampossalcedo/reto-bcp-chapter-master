import type { AvailableCardBrandsReader } from '../../capabilities/benefits/application/ports/AvailableCardBrandsReader';
import { loadEligibleBenefits } from '../../capabilities/benefits/application/usecases/loadEligibleBenefits';
import { LocalBenefitsDataSource } from '../../capabilities/benefits/infrastructure/datasources/LocalBenefitsDataSource';
import { MockBenefitRepository } from '../../capabilities/benefits/infrastructure/repositories/MockBenefitRepository';
import type { CardRepository } from '../../capabilities/cards/domain/repositories/CardRepository';
import { cardRepository } from './cardsDependencies';

export class RepositoryCardBrandsReader implements AvailableCardBrandsReader {
  constructor(private readonly cards: CardRepository) {}
  async getAvailableBrands() {
    const cards = await this.cards.listCards();
    return [
      ...new Set(cards.map(c => c.brand.trim().toUpperCase()).filter(Boolean)),
    ];
  }
}
const repository = new MockBenefitRepository(new LocalBenefitsDataSource());
const reader = new RepositoryCardBrandsReader(cardRepository);
export const loadLocalBenefits = () => loadEligibleBenefits(repository, reader);
