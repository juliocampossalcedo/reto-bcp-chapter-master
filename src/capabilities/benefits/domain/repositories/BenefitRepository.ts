import type { Benefit } from '../models/Benefit';

export interface BenefitRepository {
  listBenefits(): Promise<readonly Benefit[]>;
}
