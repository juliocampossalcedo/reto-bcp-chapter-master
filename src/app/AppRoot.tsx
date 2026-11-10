import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppHeader from './components/AppHeader';
import DashboardNavigator from './navigation/DashboardNavigator';
import { colors, spacing } from './theme/tokens';
import { authGateway as defaultAuthGateway } from './composition/authDependencies';
import {
  authErrorMessage,
  type AuthGateway,
} from '../capabilities/auth/application/ports/AuthGateway';
import { useAuthSession } from '../capabilities/auth/presentation/hooks/useAuthSession';
import { LoginScreen } from '../capabilities/auth/presentation/screens/LoginScreen';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.ink,
    border: colors.border,
  },
};

export default function AppRoot({
  authGateway = defaultAuthGateway,
}: { authGateway?: AuthGateway } = {}): React.JSX.Element {
  const { session, retry } = useAuthSession(authGateway);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const logoutBusy = useRef(false);
  const logout = async () => {
    if (logoutBusy.current) return;
    logoutBusy.current = true;
    setSigningOut(true);
    setLogoutError(null);
    try {
      await authGateway.signOut();
    } catch (error) {
      setLogoutError(authErrorMessage(error));
    } finally {
      logoutBusy.current = false;
      setSigningOut(false);
    }
  };
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" />
          <AppHeader />
          {session.status === 'initializing' ? (
            <View
              style={styles.status}
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel="Verificando sesión"
            >
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.message}>Verificando sesión…</Text>
            </View>
          ) : session.status === 'error' ? (
            <View style={styles.status}>
              <Text
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                style={styles.error}
              >
                {session.message}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={retry}
                style={styles.action}
              >
                <Text style={styles.actionText}>Reintentar</Text>
              </Pressable>
            </View>
          ) : session.status === 'signedOut' ? (
            <LoginScreen gateway={authGateway} />
          ) : (
            <>
              <View style={styles.sessionActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar sesión"
                  accessibilityState={{
                    disabled: signingOut,
                    busy: signingOut,
                  }}
                  disabled={signingOut}
                  onPress={logout}
                  style={styles.action}
                >
                  <Text style={styles.actionText}>
                    {signingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
                  </Text>
                </Pressable>
                {logoutError ? (
                  <Text
                    accessibilityRole="alert"
                    accessibilityLiveRegion="polite"
                    style={styles.error}
                  >
                    {logoutError}
                  </Text>
                ) : null}
              </View>
              <DashboardNavigator />
            </>
          )}
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  status: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  message: { color: colors.muted, fontSize: 16, marginTop: spacing.md },
  error: { color: colors.error, fontSize: 15 },
  action: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  actionText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  sessionActions: { alignItems: 'flex-end', paddingHorizontal: spacing.md },
});
