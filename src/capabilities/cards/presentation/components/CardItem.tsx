import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '../../../../app/theme/tokens';
import type { Card } from '../../domain/models/Card';

export function CardItem({
  card,
  onReveal,
  revealDisabled,
  actionHint,
}: {
  card: Card;
  onReveal?: (cardId: string) => void;
  revealDisabled?: boolean;
  actionHint?: string;
}): React.JSX.Element {
  const disabled = !onReveal || revealDisabled;
  return (
    <View style={styles.container} testID={`card-${card.cardId}`}>
      <View style={styles.decoration} accessible={false} />
      <View style={styles.topRow}>
        <Text style={styles.alias}>{card.alias}</Text>
        <Text style={styles.brand}>{card.brand}</Text>
      </View>
      <Text
        style={styles.pan}
        accessibilityLabel={`Tarjeta terminada en ${card.maskedPan.slice(-4)}`}
      >
        {card.maskedPan}
      </Text>
      <Text style={styles.expiry}>Vence {card.expiry}</Text>
      <View style={styles.actionArea}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver datos sensibles"
          accessibilityHint={actionHint ?? 'Disponible en la próxima etapa'}
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={() => onReveal?.(card.cardId)}
          style={styles.disabledAction}
        >
          <Text style={styles.disabledActionText}>Ver datos sensibles</Text>
        </Pressable>
        <Text style={styles.caption}>
          {actionHint ?? 'Disponible en la próxima etapa'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.xl,
  },
  decoration: {
    backgroundColor: colors.accent,
    borderRadius: 100,
    height: 150,
    opacity: 0.22,
    position: 'absolute',
    right: -50,
    top: -55,
    width: 150,
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alias: {
    color: colors.surface,
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    marginRight: spacing.sm,
  },
  brand: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  pan: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginTop: spacing.xxl,
  },
  expiry: {
    color: colors.surface,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  actionArea: {
    borderTopColor: 'rgba(255,255,255,0.25)',
    borderTopWidth: 1,
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
  },
  disabledAction: {
    alignItems: 'center',
    borderColor: colors.surface,
    borderRadius: radii.sm,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    opacity: 0.72,
    paddingHorizontal: spacing.md,
  },
  disabledActionText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  caption: {
    color: colors.surface,
    fontSize: 12,
    marginTop: spacing.sm,
    opacity: 0.9,
    textAlign: 'center',
  },
});
