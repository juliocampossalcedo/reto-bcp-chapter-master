import { Platform } from 'react-native';
import { NativeIoSecureView } from 'io-native-components';
import { NativeSecureTokenProvider } from '../../capabilities/cards/infrastructure/native/NativeSecureTokenProvider';
import { NativeSecureViewGateway } from '../../capabilities/cards/infrastructure/native/NativeSecureViewGateway';

const module =
  Platform.OS === 'android' || Platform.OS === 'ios'
    ? NativeIoSecureView
    : null;

export const secureDependencies = module
  ? {
      tokenProvider: new NativeSecureTokenProvider(module),
      gateway: new NativeSecureViewGateway(module),
    }
  : null;
