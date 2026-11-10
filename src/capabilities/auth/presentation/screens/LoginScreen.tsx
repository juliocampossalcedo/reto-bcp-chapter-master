import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../../../app/theme/tokens';
import {
  authErrorMessage,
  type AuthGateway,
} from '../../application/ports/AuthGateway';

export function LoginScreen({ gateway }: { gateway: AuthGateway }) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('julio@retobcp.com');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);

  const submit = async () => {
    if (busy.current) return;
    const address = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) || !password.length) {
      setError('Ingresa un correo electrónico válido y tu contraseña.');
      return;
    }
    busy.current = true;
    setPending(true);
    setError(null);
    try {
      await gateway.signIn(address, password);
      setPassword('');
      // The session observer, not this Promise, grants Dashboard access.
    } catch (failure) {
      setError(authErrorMessage(failure));
    } finally {
      busy.current = false;
      setPending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.viewport}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        <Text style={styles.title} accessibilityRole="header">
          Bienvenido a iO
        </Text>
        <Text style={styles.description}>
          Ingresa para consultar tus productos y beneficios.
        </Text>
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          accessibilityLabel="Correo electrónico"
          accessibilityHint="Ingresa el correo de tu cuenta de demostración"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          editable={!pending}
          style={styles.input}
        />
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          accessibilityLabel="Contraseña"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={() => {
            submit();
          }}
          returnKeyType="go"
          editable={!pending}
          style={styles.input}
        />
        {error ? (
          <Text
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={styles.error}
          >
            {error}
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ingresar"
          accessibilityState={{ disabled: pending, busy: pending }}
          disabled={pending}
          onPress={() => {
            submit();
          }}
          style={styles.button}
        >
          {pending ? (
            <ActivityIndicator
              color={colors.surface}
              accessibilityLabel="Iniciando sesión"
            />
          ) : (
            <Text style={styles.buttonText}>Ingresar</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  viewport: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink },
  description: {
    fontSize: 16,
    color: colors.muted,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    color: colors.ink,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.lg,
  },
  button: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    marginTop: spacing.md,
  },
  buttonText: { fontSize: 17, fontWeight: '700', color: colors.surface },
  error: { color: colors.error, fontSize: 15, marginBottom: spacing.md },
});
