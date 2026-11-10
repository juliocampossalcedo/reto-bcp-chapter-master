import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '../theme/tokens';

export default function AppHeader(): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.mark} accessible={false}>
        <Text style={styles.markText}>iO</Text>
      </View>
      <View style={styles.identity}>
        <Text style={styles.title} accessibilityRole="header">
          iO Productos & Beneficios
        </Text>
        <Text style={styles.subtitle}>Tu espacio financiero</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  mark: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  markText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: '800',
  },
  identity: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
