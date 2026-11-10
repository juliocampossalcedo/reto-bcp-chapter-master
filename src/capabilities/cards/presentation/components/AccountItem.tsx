import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '../../../../app/theme/tokens';
import type { Account } from '../../domain/models/Account';

export function AccountItem({
  account,
}: {
  account: Account;
}): React.JSX.Element {
  return (
    <View style={styles.container} testID={`account-${account.accountId}`}>
      <View style={styles.symbol} accessible={false}>
        <Text style={styles.symbolText}>▤</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.alias}>{account.alias}</Text>
        <Text style={styles.number}>
          {account.maskedNumber ?? 'Número no disponible'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    minHeight: 76,
    padding: spacing.md,
  },
  symbol: {
    alignItems: 'center',
    backgroundColor: colors.subtle,
    borderRadius: radii.sm,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  symbolText: { color: colors.primary, fontSize: 23 },
  details: { flex: 1, marginLeft: spacing.md },
  alias: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  number: { color: colors.muted, fontSize: 14, marginTop: spacing.xs },
});
