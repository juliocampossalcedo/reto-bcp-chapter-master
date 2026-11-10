export type SecureViewErrorCode = 'TOKEN_EXPIRED' | 'TOKEN_INVALID';
export type SecureViewCloseReason = 'USER_DISMISS' | 'TIMEOUT';

export interface OpenSecureViewRequest {
  readonly cardId: string;
  readonly secureToken: string;
}

export type SecureViewEvent =
  | {
      readonly name: 'onSecureViewOpened';
      readonly payload: { readonly cardId: string };
    }
  | {
      readonly name: 'onValidationError';
      readonly payload: {
        readonly code: SecureViewErrorCode;
        readonly message: string;
      };
    }
  | {
      readonly name: 'onCardDataShown';
      readonly payload: { readonly cardId: string };
    }
  | {
      readonly name: 'onSecureViewClosed';
      readonly payload: {
        readonly cardId: string;
        readonly reason: SecureViewCloseReason;
      };
    };

export type UnsubscribeSecureView = () => void;

export interface SecureViewGateway {
  openSecureView(request: OpenSecureViewRequest): Promise<void>;
  subscribe(listener: (event: SecureViewEvent) => void): UnsubscribeSecureView;
}
