import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AccessibilityInfo,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type ListRenderItem,
} from 'react-native';
import type { Benefit } from '../../domain/models/Benefit';
import { colors } from '../../../../app/theme/tokens';
import { BenefitCarouselCard } from './BenefitCarouselCard';
import {
  CarouselCoordinator,
  carouselGeometry,
} from '../utils/CarouselCoordinator';

export interface BenefitsCarouselHandle {
  align: (id: string) => void;
}
interface Props {
  benefits: readonly Benefit[];
  selectedBenefitId: string | null;
  onBenefitSettled: (id: string) => void;
  active: boolean;
}
const keyExtractor = (benefit: Benefit) => String(benefit.id);

export const BenefitsCarousel = forwardRef<BenefitsCarouselHandle, Props>(
  function Carousel(
    { benefits, selectedBenefitId, onBenefitSettled, active },
    ref,
  ) {
    const [width, setWidth] = useState(0);
    const { fontScale } = useWindowDimensions();
    const [cardHeight, setCardHeight] = useState(0);
    const [reduceMotion, setReduceMotion] = useState(false);
    const list = useRef<FlatList<Benefit>>(null);
    const contentWidth = useRef(0);
    const callback = useRef(onBenefitSettled);
    const lastSettled = useRef<string | null>(null);
    const previousSelection = useRef<string | null>(null);
    const coordinator = useRef<CarouselCoordinator | null>(null);
    if (coordinator.current === null) {
      coordinator.current = new CarouselCoordinator(
        {
          toIndex: (index, animated) =>
            list.current?.scrollToIndex({ index, animated }),
          toOffset: offset =>
            list.current?.scrollToOffset({ offset, animated: false }),
        },
        id => {
          lastSettled.current = id;
          callback.current(id);
        },
      );
    }
    const ids = useMemo(() => benefits.map(keyExtractor), [benefits]);
    const idToIndex = useMemo(
      () => new Map(ids.map((id, i) => [id, i])),
      [ids],
    );
    const { cardWidth, gap, stride } = carouselGeometry(width, benefits.length);
    useEffect(() => setCardHeight(0), [benefits, fontScale]);
    useLayoutEffect(() => {
      callback.current = onBenefitSettled;
    }, [onBenefitSettled]);
    useLayoutEffect(() => {
      const controller = coordinator.current;
      if (!controller) {
        return;
      }
      const changed = controller.configure(ids, stride, active);
      const selectionChanged = previousSelection.current !== selectedBenefitId;
      if (
        changed ||
        (selectionChanged && lastSettled.current !== selectedBenefitId)
      ) {
        controller.align(selectedBenefitId, !changed && !reduceMotion);
      }
      previousSelection.current = selectedBenefitId;
      lastSettled.current = null;
    }, [ids, stride, active, selectedBenefitId, reduceMotion]);
    useEffect(() => {
      let alive = true;
      AccessibilityInfo.isReduceMotionEnabled()
        .then(value => {
          if (alive) {
            setReduceMotion(value);
          }
        })
        .catch(() => {});
      const subscription = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        setReduceMotion,
      );
      return () => {
        alive = false;
        subscription.remove();
        coordinator.current?.dispose();
      };
    }, []);
    useImperativeHandle(
      ref,
      () => ({ align: id => coordinator.current?.align(id, !reduceMotion) }),
      [reduceMotion],
    );
    const layout = useCallback(
      (event: LayoutChangeEvent) =>
        setWidth(Math.max(0, event.nativeEvent.layout.width)),
      [],
    );
    const measureCard = useCallback((event: LayoutChangeEvent) => {
      const height = Math.ceil(event.nativeEvent.layout.height);
      setCardHeight(current => Math.max(current, height));
    }, []);
    const renderItem: ListRenderItem<Benefit> = useCallback(
      ({ item, index }) => (
        <View
          onLayout={measureCard}
          style={{ width: stride, paddingRight: gap }}
        >
          <BenefitCarouselCard
            benefit={item}
            selected={String(item.id) === selectedBenefitId}
            index={index}
            total={benefits.length}
            width={cardWidth}
            onSelect={onBenefitSettled}
          />
        </View>
      ),
      [
        stride,
        gap,
        selectedBenefitId,
        benefits.length,
        cardWidth,
        onBenefitSettled,
        measureCard,
      ],
    );
    const itemLayout = useCallback(
      (_data: ArrayLike<Benefit> | null | undefined, index: number) => ({
        length: stride,
        offset: index * stride,
        index,
      }),
      [stride],
    );
    const index =
      selectedBenefitId === null ? -1 : idToIndex.get(selectedBenefitId) ?? -1;
    if (!benefits.length) {
      return null;
    }
    return (
      <View
        onLayout={layout}
        testID="benefits-carousel"
        style={styles.container}
      >
        <View style={styles.controls}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Beneficio anterior"
            accessibilityState={{ disabled: index <= 0 }}
            disabled={index <= 0}
            style={styles.button}
            onPress={() => onBenefitSettled(ids[index - 1])}
          >
            <Text style={styles.controlText}>Anterior</Text>
          </Pressable>
          <Text style={styles.counter}>{`Beneficio ${index + 1} de ${
            benefits.length
          }`}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Beneficio siguiente"
            accessibilityState={{
              disabled: index < 0 || index >= ids.length - 1,
            }}
            disabled={index < 0 || index >= ids.length - 1}
            style={styles.button}
            onPress={() => onBenefitSettled(ids[index + 1])}
          >
            <Text style={styles.controlText}>Siguiente</Text>
          </Pressable>
        </View>
        {width > 0 ? (
          <FlatList
            ref={list}
            style={[
              styles.list,
              {
                height:
                  cardHeight > 0 ? cardHeight : 260 * Math.max(1, fontScale),
              },
            ]}
            testID="benefits-carousel-list"
            horizontal
            data={benefits}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            extraData={selectedBenefitId}
            showsHorizontalScrollIndicator={false}
            scrollEnabled={benefits.length > 1}
            snapToInterval={stride}
            snapToAlignment="start"
            decelerationRate="fast"
            getItemLayout={itemLayout}
            initialNumToRender={3}
            maxToRenderPerBatch={4}
            windowSize={5}
            contentContainerStyle={{
              alignItems: 'flex-start',
              paddingRight: Math.max(0, width - stride),
            }}
            onScrollBeginDrag={event =>
              coordinator.current?.beginDrag(event.timeStamp)
            }
            onScroll={event =>
              coordinator.current?.scrollOffset(
                event.nativeEvent.contentOffset.x,
              )
            }
            scrollEventThrottle={16}
            onScrollEndDrag={event =>
              coordinator.current?.endDrag(
                event.nativeEvent.contentOffset.x,
                event.timeStamp,
              )
            }
            onMomentumScrollBegin={event =>
              coordinator.current?.momentumBegin(event.timeStamp)
            }
            onMomentumScrollEnd={event =>
              coordinator.current?.momentumEnd(
                event.nativeEvent.contentOffset.x,
                event.timeStamp,
              )
            }
            onContentSizeChange={nextWidth => {
              if (nextWidth > 0 && nextWidth !== contentWidth.current) {
                contentWidth.current = nextWidth;
                coordinator.current?.align(selectedBenefitId, false);
              }
            }}
            onScrollToIndexFailed={info =>
              coordinator.current?.failed(info.index)
            }
          />
        ) : null}
      </View>
    );
  },
);
const styles = StyleSheet.create({
  list: { flexGrow: 0 },
  container: { flexGrow: 0, marginVertical: 4 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  button: { minHeight: 48, paddingHorizontal: 8, justifyContent: 'center' },
  controlText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  counter: { color: colors.ink, fontSize: 14 },
});
