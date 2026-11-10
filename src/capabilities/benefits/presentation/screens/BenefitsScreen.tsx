import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CustomMap, type MapStatus } from 'io-native-components';
import type { EligibleBenefits } from '../../application/usecases/loadEligibleBenefits';
import {
  BenefitsCarousel,
  type BenefitsCarouselHandle,
} from '../components/BenefitsCarousel';
import { useBenefitsStore } from '../store/useBenefitsStore';
import { benefitToMapMarker } from '../mappers/benefitToMapMarker';
import { colors, spacing } from '../../../../app/theme/tokens';

export function BenefitsScreen({
  loadBenefits,
  isFocused = true,
}: {
  loadBenefits: () => Promise<EligibleBenefits>;
  isFocused?: boolean;
}): React.JSX.Element {
  const status = useBenefitsStore(value => value.status);
  const data = useBenefitsStore(value => value.data);
  const selectedBenefitId = useBenefitsStore(value => value.selectedBenefitId);
  const selectBenefit = useBenefitsStore(value => value.selectBenefit);
  const startLoad = useBenefitsStore(value => value.startLoad);
  const carousel = useRef<BenefitsCarouselHandle>(null);
  const [attempt, setAttempt] = useState(0);
  const [mapStatus, setMapStatus] = useState<'loading' | MapStatus>('loading');
  useEffect(() => {
    setMapStatus('loading');
    return startLoad(loadBenefits, attempt > 0);
  }, [loadBenefits, attempt, startLoad]);
  const benefits = status === 'ready' ? data?.benefits : undefined;
  const markers = useMemo(
    () => benefits?.map(benefitToMapMarker) ?? [],
    [benefits],
  );
  useEffect(() => {
    if (!markers.length || mapStatus !== 'loading') {
      return;
    }
    const timer = setTimeout(() => setMapStatus('unavailable'), 20000);
    return () => clearTimeout(timer);
  }, [markers, mapStatus, attempt]);
  const onStatus = useCallback(
    (nextStatus: MapStatus) => setMapStatus(nextStatus),
    [],
  );
  const onMarkerPress = useCallback(
    (id: string) => {
      if (markers.some(m => m.id === id)) {
        if (id === useBenefitsStore.getState().selectedBenefitId) {
          carousel.current?.align(id);
        }
        selectBenefit(id);
      }
    },
    [markers, selectBenefit],
  );
  const chosen = markers.find(m => m.id === selectedBenefitId);
  const error = status === 'error' || mapStatus === 'unavailable';
  return (
    <ScrollView
      style={styles.viewport}
      contentContainerStyle={styles.container}
    >
      <Text accessibilityRole="header" style={styles.heading}>
        Beneficios
      </Text>
      <>
        {status === 'loading' || status === 'idle' ? (
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel="Cargando beneficios"
          >
            <ActivityIndicator />
            <Text style={styles.text}>Cargando beneficios…</Text>
          </View>
        ) : null}
        {error ? (
          <View accessibilityLiveRegion="polite">
            <Text style={styles.text}>
              No pudimos cargar el mapa o los beneficios. Revisa tu conexión y
              la configuración del mapa.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setAttempt(a => a + 1)}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : null}
        {status === 'ready' && !error ? (
          benefits?.length === 0 ? (
            <Text style={styles.text}>
              No tienes beneficios disponibles para tus tarjetas
            </Text>
          ) : (
            <>
              <Text style={styles.text}>
                {markers.length} beneficios disponibles para tus tarjetas
              </Text>
              {(data?.omittedLocations ?? 0) > 0 ? (
                <Text style={styles.text}>
                  Algunos beneficios no se pueden ubicar
                </Text>
              ) : null}
              <View style={styles.map}>
                <CustomMap
                  key={attempt}
                  markers={markers}
                  selectedMarkerId={selectedBenefitId}
                  onMarkerPress={onMarkerPress}
                  onStatus={onStatus}
                />
                {mapStatus === 'loading' ? (
                  <View pointerEvents="none" style={styles.loading}>
                    <ActivityIndicator />
                    <Text style={styles.text}>Cargando mapa…</Text>
                  </View>
                ) : null}
              </View>
              <Text accessibilityLiveRegion="polite" style={styles.text}>
                {chosen
                  ? `Beneficio seleccionado: ${chosen.title}`
                  : 'Selecciona un beneficio en el mapa o en la lista'}
              </Text>
              <BenefitsCarousel
                ref={carousel}
                benefits={benefits ?? []}
                selectedBenefitId={selectedBenefitId}
                onBenefitSettled={selectBenefit}
                active={isFocused}
              />
              <View style={styles.alternatives}>
                <Text
                  accessibilityRole="header"
                  style={styles.alternativesTitle}
                >
                  Beneficios en lista
                </Text>
                <Text style={styles.alternativesHint}>
                  Elige un beneficio sin usar el mapa.
                </Text>
                {markers.map(marker => (
                  <Pressable
                    key={marker.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Seleccionar ${marker.title}`}
                    accessibilityState={{
                      selected: marker.id === selectedBenefitId,
                    }}
                    onPress={() => selectBenefit(marker.id)}
                    style={[
                      styles.textButton,
                      marker.id === selectedBenefitId &&
                        styles.textButtonSelected,
                    ]}
                  >
                    <Text style={styles.buttonText}>
                      {marker.title}
                      {marker.id === selectedBenefitId ? ' ✓' : ''}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )
        ) : null}
      </>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  viewport: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  text: { fontSize: 15, color: colors.muted, marginVertical: spacing.sm },
  map: { height: 200, minHeight: 150, overflow: 'hidden', borderRadius: 16 },
  loading: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  alternatives: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  alternativesTitle: { color: colors.ink, fontSize: 18, fontWeight: '700' },
  alternativesHint: {
    color: colors.muted,
    fontSize: 14,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  button: {
    minHeight: 48,
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.subtle,
    borderRadius: 12,
  },
  textButton: {
    minHeight: 48,
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: 10,
  },
  textButtonSelected: { backgroundColor: colors.subtle },
  buttonText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
});
