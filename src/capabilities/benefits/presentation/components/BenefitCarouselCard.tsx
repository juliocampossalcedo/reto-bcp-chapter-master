import React, { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { Benefit } from '../../domain/models/Benefit';
import { colors, radii, spacing } from '../../../../app/theme/tokens';

export const BenefitCarouselCard = memo(function Card({
  benefit,
  selected,
  index,
  total,
  width,
  onSelect,
}: {
  benefit: Benefit;
  selected: boolean;
  index: number;
  total: number;
  width: number;
  onSelect: (id: string) => void;
}): React.JSX.Element {
  return (
    <Pressable
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Beneficio ${index + 1} de ${total}, ${
        benefit.title
      }, ${benefit.promotion}${selected ? ', seleccionado' : ''}`}
      accessibilityState={{ selected }}
      onPress={() => onSelect(String(benefit.id))}
      style={[styles.card, { width }, selected && styles.selected]}
    >
      <Text style={styles.promotion}>{benefit.promotion}</Text>
      <Text style={styles.title}>{benefit.title}</Text>
      <Text style={styles.address}>{benefit.address}</Text>
      <Text numberOfLines={2} style={styles.description}>
        {benefit.description}
      </Text>
      {selected ? (
        <Text style={styles.selection}>✓ Seleccionado</Text>
      ) : (
        <Text style={styles.selection}>Seleccionar beneficio</Text>
      )}
    </Pressable>
  );
});
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    minHeight: 168,
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.subtle },
  promotion: { color: colors.accent, fontWeight: '800', fontSize: 18 },
  title: { color: colors.ink, fontWeight: '700', fontSize: 17, marginTop: 4 },
  address: { color: colors.ink, fontSize: 14, marginTop: 4 },
  description: { color: colors.muted, fontSize: 13, marginTop: 4 },
  selection: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
});
