import type { Benefit } from '../../domain/models/Benefit';

export type BenefitRecord = Readonly<Benefit>;

export interface BenefitsDataSource {
  readBenefits(): Promise<readonly BenefitRecord[]>;
}
