import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  FlatList,
  Pressable,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewToken,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useImmersiveSafeAreaInsets } from '@/components/immersive/edge-to-edge-hero';
import { AppleWalletIcon } from '@/components/tickets/apple-wallet-icon';
import { EditableText } from '@/components/tickets/EditableText';
import { ExtrasPanel } from '@/components/tickets/ticket-transfer-flow-extras-panel';
import { softPillShadow } from '@/components/tickets/ticketFlowConstants';
import type { Seat } from '@/components/tickets/ticketFlowTypes';
import { useTicketFlowData } from '@/components/tickets/useTicketFlowData';
import { BottomDrawer } from '@/components/ui/bottom-drawer';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { TicketCard } from './ticket-card';

function ViewerHeader({ onBack }: { onBack: () => void }) {
  const { event } = useTicketFlowData();
  const insets = useImmersiveSafeAreaInsets();
  const { width } = useWindowDimensions();
  const shortTitleWidth = Math.round(width * 0.9);
  const shortTitle = toCapitalizedTitle(event.shortTitle);
  console.log('event.shortTitle', event.shortTitle);

  return (
    <View
      className='-mb-6'
      style={{
        backgroundColor: '#F9F8F4',
        paddingTop:
          Platform.OS === 'web'
            ? 12
            : insets.top + (Platform.OS === 'ios' ? 4 : 2),
      }}
    >
      <View className='flex-row items-center justify-left bg-[#F9F8F4] gap-4 pl-4 pb-2 pt-0'>
        <Pressable
          accessibilityRole='button'
          hitSlop={8}
          onPress={onBack}
      
        >
          <Ionicons color='#000000' name='chevron-back' size={28} />
        </Pressable>

        <View className='justify-center'>
          <EditableText
            field='eventName'
            value={shortTitle}
            className='text-[16px]  font-extrabold text-[#000000] mb-1.5'
            style={{
              textTransform: 'capitalize',
              width: shortTitleWidth,
            }}
          />
          <EditableText
            value={event.headerSubtitle}
            className='text-[14px] font-medium text-[#525050]'
          />
        </View>
      </View>
    </View>
  );
}

function toCapitalizedTitle(value: string) {
  return value.replace(/\S+/g, (word) => {
    return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
  });
}

export function TicketTransferViewerScreen({
  carouselCardWidth,
  carouselSnapInterval,
  onBack,
  onViewerIndexChange,
  seats,
  viewerIndex,
}: {
  carouselCardWidth: number;
  carouselSnapInterval: number;
  onBack: () => void;
  onViewerIndexChange: (index: number) => void;
  seats: Seat[];
  viewerIndex: number;
}) {
  const viewerListRef = useRef<FlatList<Seat>>(null);
  const onViewerIndexChangeRef = useRef(onViewerIndexChange);
  const viewerIndexRef = useRef(viewerIndex);
  const seatsLengthRef = useRef(seats.length);
  const dragStartOffsetRef = useRef(0);
  const [isTicketInfoOpen, setIsTicketInfoOpen] = React.useState(false);
  const normalizedViewerIndex = seats.length
    ? Math.max(0, Math.min(seats.length - 1, viewerIndex))
    : 0;

  useEffect(() => {
    onViewerIndexChangeRef.current = onViewerIndexChange;
  }, [onViewerIndexChange]);

  useEffect(() => {
    seatsLengthRef.current = seats.length;
  }, [seats.length]);

  useEffect(() => {
    if (normalizedViewerIndex === viewerIndexRef.current) {
      return;
    }

    viewerIndexRef.current = normalizedViewerIndex;
    requestAnimationFrame(() => {
      viewerListRef.current?.scrollToOffset({
        animated: true,
        offset: normalizedViewerIndex * carouselSnapInterval,
      });
    });
  }, [carouselSnapInterval, normalizedViewerIndex]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;
  const seatSetKey = `${seats.length}:${seats[0]?.id ?? ''}:${
    seats[seats.length - 1]?.id ?? ''
  }`;

  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<Seat>[] }) => {
      const activeItem = viewableItems.find(
        (item) => item.isViewable && typeof item.index === 'number',
      );

      if (typeof activeItem?.index !== 'number' || seatsLengthRef.current <= 0) {
        return;
      }

      const nextIndex = Math.max(
        0,
        Math.min(seatsLengthRef.current - 1, activeItem.index),
      );

      if (nextIndex !== viewerIndexRef.current) {
        viewerIndexRef.current = nextIndex;
        onViewerIndexChangeRef.current(nextIndex);
      }
    },
  ).current;

  useEffect(() => {
    requestAnimationFrame(() => {
      viewerListRef.current?.scrollToOffset({
        animated: false,
        offset: viewerIndexRef.current * carouselSnapInterval,
      });
    });
  }, [carouselSnapInterval, seatSetKey]);

  const handleViewerScrollBeginDrag = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    dragStartOffsetRef.current = event.nativeEvent.contentOffset.x;
  };

  const handleViewerScrollEndDrag = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const dragDelta = offsetX - dragStartOffsetRef.current;
    const velocityX = event.nativeEvent.velocity?.x ?? 0;
    const dragDirection =
      Math.abs(velocityX) > 0.12 ? Math.sign(velocityX) : Math.sign(dragDelta);
    const startingIndex = Math.round(
      dragStartOffsetRef.current / carouselSnapInterval,
    );
    const shouldStep =
      Math.abs(velocityX) > 0.12 ||
      Math.abs(dragDelta) > carouselSnapInterval * 0.18;

    settleViewerAtIndex(
      shouldStep
        ? startingIndex + dragDirection
        : Math.round(offsetX / carouselSnapInterval),
    );
  };

  const handleViewerMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    settleViewerAtIndex(
      Math.round(event.nativeEvent.contentOffset.x / carouselSnapInterval),
    );
  };

  function settleViewerAtIndex(nextIndex: number) {
    const clampedIndex = Math.max(0, Math.min(seats.length - 1, nextIndex));
    const targetOffset = clampedIndex * carouselSnapInterval;

    if (clampedIndex !== viewerIndexRef.current) {
      viewerIndexRef.current = clampedIndex;
      onViewerIndexChangeRef.current(clampedIndex);
    }

    requestAnimationFrame(() => {
      viewerListRef.current?.scrollToOffset({
        animated: true,
        offset: targetOffset,
      });
    });
  }

  const { width } = useWindowDimensions();
  const insets = useImmersiveSafeAreaInsets();
  const screenWidth = Math.min(width, 430);
  const sidePadding = (screenWidth - carouselCardWidth) / 2;
  const snapOffsets = seats.map((_, index) => index * carouselSnapInterval);

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={{ flex: 1, backgroundColor: '#F9F8F4' }}
    >
      <Head>
        <meta name='theme-color' content='#F9F8F4' />
        <meta name='color-scheme' content='light' />
      </Head>
      <StatusBar backgroundColor='#F9F8F4' style='dark' translucent={true} />
      <View className='flex-1 bg-[#F9F8F4]'>
        <ViewerHeader onBack={onBack} />

        <FlatList
          style={{ alignSelf: 'center', flex: 1, width: screenWidth }}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 40,
            paddingLeft: sidePadding,
            paddingRight: sidePadding,
            paddingTop: 30,
            alignItems: 'center',
          }}
          data={seats}
          decelerationRate='normal'
          disableIntervalMomentum
          getItemLayout={(_, index) => ({
            index,
            length: carouselSnapInterval,
            offset: carouselSnapInterval * index,
          })}
          horizontal
          initialScrollIndex={normalizedViewerIndex}
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={handleViewerMomentumScrollEnd}
          onScrollBeginDrag={handleViewerScrollBeginDrag}
          onScrollEndDrag={handleViewerScrollEndDrag}
          onViewableItemsChanged={handleViewableItemsChanged}
          ref={viewerListRef}
          removeClippedSubviews={false}
          renderItem={({ item, index }) => (
            <TicketCard
              cardWidth={carouselCardWidth}
              index={index}
              seat={item}
            />
          )}
          scrollEnabled={seats.length > 1}
          showsHorizontalScrollIndicator={false}
          snapToAlignment='start'
          snapToOffsets={snapOffsets}
          viewabilityConfig={viewabilityConfig}
        />

        <Animated.View
          entering={FadeInUp.duration(260)}
          className='mt-auto items-center gap-10 px-5'
          style={{
            paddingBottom: Math.max(insets.bottom + 24, 24),
          }}
        >
          <View
            className='rounded-full bg-white px-5 py-[10px]'
            style={softPillShadow}
          >
            <Text className='text-center text-[12px] font-bold text-[#111111]'>
              {`${normalizedViewerIndex + 1} of ${seats.length}`}
            </Text>
          </View>

          <View className='flex-row mt-auto w-full justify-between gap-3 px-2'>
            <Pressable
              accessibilityRole='button'
              className='h-[44px] flex-row items-center justify-center gap-2 rounded-[8px] bg-[#111111] px-4'
            >
              <AppleWalletIcon height={24} width={34} />
              <View className='flex flex-col items-center'>
                <Text className='text-[8px] font-medium text-white leading-tight'>
                  Add to
                </Text>
                <Text className='text-[12px] font-bold text-white leading-tight'>
                  Apple Wallet
                </Text>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole='button'
              className='h-[44px] flex-row items-center justify-center gap-2 rounded-full border border-[#D7DBE2] bg-[#F9F8F4] px-4'
              onPress={() => setIsTicketInfoOpen(true)}
            >
              <View className='h-6 w-6 items-center justify-center rounded-full bg-black'>
                <Ionicons color='#FFFFFF' name='information' size={15} />
              </View>
              <Text className='text-[13px] font-bold text-[#111111]'>
                Ticket Info
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
      <BottomDrawer
        minHeight='62%'
        onClose={() => setIsTicketInfoOpen(false)}
        visible={isTicketInfoOpen}
      >
        <View className='border-b border-[#F0F0F0] px-5 py-4'>
          <Text className='text-center text-[12px] font-medium leading-[15px] text-[#70757E]'>
            TICKET INFO
          </Text>
        </View>
        <ExtrasPanel />
      </BottomDrawer>
    </SafeAreaView>
  );
}
