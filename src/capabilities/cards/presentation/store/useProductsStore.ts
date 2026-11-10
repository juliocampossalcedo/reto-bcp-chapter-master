import { create } from 'zustand';

import type { ProductsSnapshot } from '../../application/usecases/loadProducts';
import type { Account } from '../../domain/models/Account';
import type { Card } from '../../domain/models/Card';

export type ProductsStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export type ProductsLoader = () => Promise<ProductsSnapshot>;

interface ProductsState {
  readonly accounts: readonly Account[];
  readonly cards: readonly Card[];
  readonly status: ProductsStatus;
  readonly errorMessage: string | null;
  load: (loader: ProductsLoader, retry?: boolean) => Promise<void>;
}

let latestRequest = 0;

export const useProductsStore = create<ProductsState>((set, get) => ({
  accounts: [],
  cards: [],
  status: 'idle',
  errorMessage: null,
  load: async (loader, retry = false) => {
    const status = get().status;
    if (!retry && ['loading', 'success', 'empty'].includes(status)) {
      return;
    }

    const request = ++latestRequest;
    set({ status: 'loading', errorMessage: null });

    try {
      const { accounts, cards } = await loader();
      if (request !== latestRequest) {
        return;
      }
      set({
        accounts,
        cards,
        status:
          accounts.length === 0 && cards.length === 0 ? 'empty' : 'success',
        errorMessage: null,
      });
    } catch {
      if (request !== latestRequest) {
        return;
      }
      set({
        status: 'error',
        errorMessage: 'No pudimos cargar tus productos. Intenta nuevamente.',
      });
    }
  },
}));
