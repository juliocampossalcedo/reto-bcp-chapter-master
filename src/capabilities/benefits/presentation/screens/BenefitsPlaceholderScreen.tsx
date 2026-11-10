import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '../../../../app/theme/tokens';

export function BenefitsPlaceholderScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.symbol} accessible={false}>
        <Text style={styles.symbolText}>✧</Text>
      </View>
      <Text accessibilityRole="header" style={styles.title}>
        Beneficios
      </Text>
      <Text style={styles.description}>
        Esta sección estará disponible en la próxima etapa.
      </Text>
      <View style={styles.note}>
        <Text style={styles.noteText}>
          Pronto podrás explorar los beneficios aplicables a tus tarjetas.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  symbol: {
    alignItems: 'center',
    backgroundColor: colors.subtle,
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: spacing.xl,
    width: 80,
  },
  symbolText: { color: colors.primary, fontSize: 42 },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: spacing.md,
    maxWidth: 320,
    textAlign: 'center',
  },
  note: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.xl,
    maxWidth: 340,
    padding: spacing.lg,
  },
  noteText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
