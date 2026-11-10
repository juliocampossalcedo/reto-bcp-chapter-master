import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, radii, spacing } from '../../../../app/theme/tokens';
import type { Card } from '../../domain/models/Card';
import { AccountItem } from '../components/AccountItem';
import { CardItem } from '../components/CardItem';
import { useProductsStore } from '../store/useProductsStore';
import type { ProductsLoader } from '../store/useProductsStore';
import type { SecureTokenProvider } from '../../application/ports/SecureTokenProvider';
import type { SecureViewGateway } from '../../application/ports/SecureViewGateway';
import { openSecureCard } from '../../application/usecases/openSecureCard';

function SectionTitle({ title, count }: { title: string; count: number }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.count}>{count}</Text>
    </View>
  );
}

function RetryButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.retryButton}
    >
      <Text style={styles.retryText}>Reintentar</Text>
    </Pressable>
  );
}

export function CardsScreen({
  loadProducts,
  secureAccess,
}: {
  loadProducts: ProductsLoader;
  secureAccess?: {
    tokenProvider: SecureTokenProvider;
    gateway: SecureViewGateway;
  } | null;
}): React.JSX.Element {
  const [secureStatus, setSecureStatus] = useState<
    'idle' | 'opening' | 'open' | 'error'
  >('idle');
  const [secureMessage, setSecureMessage] = useState<string | null>(null);
  const activeCard = useRef<string | null>(null);
  const busy = useRef(false);
  const accounts = useProductsStore(state => state.accounts);
  const cards = useProductsStore(state => state.cards);
  const status = useProductsStore(state => state.status);
  const errorMessage = useProductsStore(state => state.errorMessage);
  const load = useProductsStore(state => state.load);

  useEffect(() => {
    load(loadProducts);
  }, [load, loadProducts]);

  useEffect(() => {
    if (!secureAccess) return;
    const unsubscribe = secureAccess.gateway.subscribe(event => {
      if (event.name === 'onValidationError' && busy.current) {
        setSecureStatus('error');
        setSecureMessage(event.payload.message);
      } else if (
        event.name === 'onSecureViewOpened' &&
        event.payload.cardId === activeCard.current
      ) {
        setSecureStatus('opening');
      } else if (
        event.name === 'onCardDataShown' &&
        event.payload.cardId === activeCard.current
      ) {
        setSecureStatus('open');
      } else if (
        event.name === 'onSecureViewClosed' &&
        event.payload.cardId === activeCard.current
      ) {
        busy.current = false;
        activeCard.current = null;
        setSecureStatus('idle');
      }
    });
    return unsubscribe;
  }, [secureAccess]);

  const reveal = (cardId: string) => {
    if (!secureAccess || busy.current) return;
    busy.current = true;
    activeCard.current = cardId;
    setSecureMessage(null);
    setSecureStatus('opening');
    openSecureCard(
      cardId,
      secureAccess.tokenProvider,
      secureAccess.gateway,
    ).catch(() => {
      busy.current = false;
      activeCard.current = null;
      setSecureMessage('No se pudo abrir la vista segura. Intenta nuevamente.');
      setSecureStatus('error');
    });
  };

  const retry = () => {
    load(loadProducts, true);
  };

  const intro = (
    <View style={styles.intro}>
      <Text style={styles.eyebrow}>TU RESUMEN</Text>
      <Text style={styles.title} accessibilityRole="header">
        Mis productos
      </Text>
      <Text style={styles.subtitle}>
        Consulta tus cuentas y tarjetas con información enmascarada.
      </Text>
    </View>
  );

  if (status === 'idle' || status === 'loading') {
    return (
      <View style={styles.statusContainer}>
        {intro}
        <View style={styles.statusCard}>
          <ActivityIndicator
            accessibilityLabel="Cargando productos"
            color={colors.accent}
            size="large"
          />
          <Text style={styles.statusText}>Cargando productos...</Text>
        </View>
      </View>
    );
  }

  if (status === 'error' || status === 'empty') {
    return (
      <View style={styles.statusContainer}>
        {intro}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle} accessibilityRole="header">
            {status === 'error'
              ? 'No pudimos mostrar tus productos'
              : 'Aún no tienes productos para mostrar'}
          </Text>
          <Text style={styles.statusText}>
            {status === 'error'
              ? errorMessage
              : 'Vuelve a consultar en otro momento.'}
          </Text>
          <RetryButton onPress={retry} />
        </View>
      </View>
    );
  }

  return (
    <FlatList<Card>
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={cards}
      keyExtractor={card => card.cardId}
      renderItem={({ item }) => (
        <CardItem
          card={item}
          onReveal={secureAccess ? reveal : undefined}
          revealDisabled={
            secureStatus === 'opening' ||
            secureStatus === 'open' ||
            (secureStatus === 'error' && busy.current)
          }
          actionHint={
            secureAccess
              ? secureStatus === 'opening'
                ? 'Abriendo vista segura'
                : 'Los datos se muestran solo en una vista nativa segura'
              : 'Vista segura no disponible en este dispositivo'
          }
        />
      )}
      ListHeaderComponent={
        <View>
          {intro}
          {secureMessage ? (
            <Text accessibilityRole="alert" style={styles.statusText}>
              {secureMessage}
            </Text>
          ) : null}
          <SectionTitle title="Cuentas" count={accounts.length} />
          {accounts.length === 0 ? (
            <Text style={styles.partialEmpty}>
              No hay cuentas para mostrar.
            </Text>
          ) : (
            accounts.map(account => (
              <AccountItem key={account.accountId} account={account} />
            ))
          )}
          <SectionTitle title="Tarjetas" count={cards.length} />
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.partialEmpty}>No hay tarjetas para mostrar.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  listContent: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  statusContainer: { flex: 1, padding: spacing.lg },
  intro: { marginBottom: spacing.xl },
  eyebrow: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: spacing.sm,
  },
  title: { color: colors.ink, fontSize: 30, fontWeight: '800' },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 23,
    marginTop: spacing.sm,
  },
  sectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  count: {
    backgroundColor: colors.subtle,
    borderRadius: radii.sm,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: spacing.sm,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  partialEmpty: {
    color: colors.muted,
    fontSize: 15,
    marginBottom: spacing.xl,
  },
  statusCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.xl,
  },
  statusTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  statusText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    justifyContent: 'center',
    marginTop: spacing.xl,
    minHeight: 48,
    minWidth: 144,
    paddingHorizontal: spacing.xl,
  },
  retryText: { color: colors.surface, fontSize: 15, fontWeight: '700' },
});
