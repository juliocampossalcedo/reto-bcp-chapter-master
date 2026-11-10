import type { TurboModule, CodegenTypes } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type IssuedTokenPayload = {
  readonly value: string;
  readonly expiresAtEpochMs: number;
};
export type CardIdPayload = { readonly cardId: string };
export type ValidationErrorPayload = {
  readonly code: string;
  readonly message: string;
};
export type SecureViewClosedPayload = {
  readonly cardId: string;
  readonly reason: string;
};

export interface Spec extends TurboModule {
  issueSecureToken(cardId: string): Promise<IssuedTokenPayload>;
  openSecureView(cardId: string, secureToken: string): Promise<boolean>;
  readonly onSecureViewOpened: CodegenTypes.EventEmitter<CardIdPayload>;
  readonly onValidationError: CodegenTypes.EventEmitter<ValidationErrorPayload>;
  readonly onCardDataShown: CodegenTypes.EventEmitter<CardIdPayload>;
  readonly onSecureViewClosed: CodegenTypes.EventEmitter<SecureViewClosedPayload>;
}

export default TurboModuleRegistry.get<Spec>('IoSecureView');
