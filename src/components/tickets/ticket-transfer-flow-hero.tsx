import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import {
  Pressable,
  Text,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import {
  EdgeToEdgeHeroMedia,
  useImmersiveSafeAreaInsets,
} from '@/components/immersive/edge-to-edge-hero';
import {
  absoluteFill,
  getSummaryPhoneHeroBottomSpace,
  getTicketSummaryHeroCollapseDistance,
  getTicketSummaryHeroExpandedHeight,
  getTicketSummaryHeroImageHeight,
  HERO_COLLAPSED_HEIGHT,
} from '@/components/tickets/ticketFlowConstants';
import { useTicketFlowData } from '@/components/tickets/useTicketFlowData';

type CollapsedHeroTitleProps = {
  style: StyleProp<ViewStyle>;
  title: string;
  venue: string;
};

type ExpandedHeroCardProps = {
  dateTime: string;
  onOpenViewer: () => void;
  bottomSpace: number;
  ticketCount: number;
  title: string;
  venue: string;
};

export function CollapsibleEventHero({
  isHeroCollapsed,
  onBack,
  onOpenViewer,
  scrollY,
}: {
  isHeroCollapsed: boolean;
  onBack: () => void;
  onOpenViewer: () => void;
  scrollY: SharedValue<number>;
}) {
  const { event, order } = useTicketFlowData();
  const insets = useImmersiveSafeAreaInsets();
  const { width } = useWindowDimensions();
  const statusBarBleed = insets.top;
  const heroImageBaseHeight = getTicketSummaryHeroImageHeight(width);
  const heroImageHeight = heroImageBaseHeight + statusBarBleed;
  const heroBottomSpace = getSummaryPhoneHeroBottomSpace(width);
  const expandedHeroHeight = getTicketSummaryHeroExpandedHeight(width);
  const heroCollapseDistance = getTicketSummaryHeroCollapseDistance(width);

  const expandedLayerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, heroCollapseDistance * 0.72],
      [1, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, heroCollapseDistance],
          [0, -heroCollapseDistance * 0.42],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const collapsedTitleStyle = useAnimatedStyle<ViewStyle>(() => ({
    opacity: interpolate(
      scrollY.value,
      [heroCollapseDistance * 0.28, heroCollapseDistance * 0.8],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, heroCollapseDistance],
          [12, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <Animated.View
      pointerEvents='box-none'
      className='absolute inset-x-0 top-0 z-20'
      style={{ height: expandedHeroHeight }}
    >
      <CollapsedHeroLayer
        collapsedTitleStyle={collapsedTitleStyle}
        eventTitle={event.title}
        eventVenue={event.venue}
        heroImage={event.heroImage}
        heroImageHeight={heroImageHeight}
        isHeroCollapsed={isHeroCollapsed}
        onBack={onBack}
        onOpenViewer={onOpenViewer}
        statusBarBleed={statusBarBleed}
      />

      <Animated.View
        pointerEvents={isHeroCollapsed ? 'none' : 'box-none'}
        className='absolute inset-x-0 top-0 overflow-hidden'
        style={[{ height: expandedHeroHeight }, expandedLayerStyle]}
      >
        <EdgeToEdgeHeroMedia
          contentFit="cover"
          height={heroImageHeight}
          source={event.heroImage}
        />

        <View style={[absoluteFill, { paddingTop: statusBarBleed }]}>
          <View className='px-4'>
            <View className='mt-3 flex-row items-center justify-between'>
              <HeaderBackButton onBack={onBack} />
              <View className='rounded-full bg-black/40 p-3'>
                <Text className='text-[13px] font-medium leading-4 text-white'>
                  Help
                </Text>
              </View>
            </View>
          </View>

          <View
            className='absolute inset-x-0 px-4'
            style={{ top: heroImageBaseHeight }}
          >
            <ExpandedHeroCard
              bottomSpace={heroBottomSpace}
              dateTime={event.dateTime}
              onOpenViewer={onOpenViewer}
              ticketCount={order.ticketCount}
              title={event.title}
              venue={event.venue}
            />
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function CollapsedHeroLayer({
  collapsedTitleStyle,
  eventTitle,
  eventVenue,
  heroImage,
  heroImageHeight,
  isHeroCollapsed,
  onBack,
  onOpenViewer,
  statusBarBleed,
}: {
  collapsedTitleStyle: StyleProp<ViewStyle>;
  eventTitle: string;
  eventVenue: string;
  heroImage: React.ComponentProps<typeof EdgeToEdgeHeroMedia>['source'];
  heroImageHeight: number;
  isHeroCollapsed: boolean;
  onBack: () => void;
  onOpenViewer: () => void;
  statusBarBleed: number;
}) {
  return (
    <View
      pointerEvents='box-none'
      className='absolute inset-x-0 top-0 overflow-hidden'
      style={{ height: HERO_COLLAPSED_HEIGHT }}
    >
      <EdgeToEdgeHeroMedia
        contentFit="cover"
        height={heroImageHeight}
        source={heroImage}
      />
      <View style={[absoluteFill, { paddingTop: statusBarBleed }]}>
        <View className='px-4'>
          <View className='mt-3 flex-row items-center justify-between'>
            <HeaderBackButton onBack={onBack} />
            <CollapsedHeroTitle
              style={collapsedTitleStyle}
              title={eventTitle}
              venue={eventVenue}
            />
            {isHeroCollapsed ? (
              <Pressable
                accessibilityRole='button'
                hitSlop={8}
                onPress={onOpenViewer}
                className='h-7 w-11 items-center justify-center rounded-[14px] bg-[#0B55F5]'
              >
                <Ionicons color='#FFFFFF' name='barcode-outline' size={26} />
              </Pressable>
            ) : (
              <View className='rounded-full bg-black/40 p-3'>
                <Text className='text-[13px] font-medium leading-4 text-white'>
                  Help
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

function HeaderBackButton({ onBack }: { onBack: () => void }) {
  return (
    <Pressable
      accessibilityRole='button'
      hitSlop={8}
      onPress={onBack}
      className='h-10 w-10 items-center justify-center rounded-full bg-[rgba(0,0,0,0.40)]'
    >
      <Ionicons color='#FFFFFF' name='arrow-back' size={24} />
    </Pressable>
  );
}

function CollapsedHeroTitle({ style, title, venue }: CollapsedHeroTitleProps) {
  return (
    <Animated.View
      style={[style, { pointerEvents: 'none' }]}
      className='absolute left-16 right-16 items-center'
    >
      <Text className='mb-1 text-center text-[13px] font-extrabold text-white'>
        {title}
      </Text>
      <Text
        numberOfLines={1}
        className='text-center text-[11px] font-normal leading-[13px] text-[rgba(255,255,255,0.84)]'
      >
        {venue}
      </Text>
    </Animated.View>
  );
}

function ExpandedHeroCard({
  bottomSpace,
  dateTime,
  onOpenViewer,
  ticketCount,
  title,
  venue,
}: ExpandedHeroCardProps) {
  return (
    <View className="ticket-summary-hero-card relative summary-phone:-top-[15.8px] -top-[10px] pt-4 ">
      <View className="absolute left-0 summary-phone:-top-[19.3px] -top-4 z-10 self-start">
        <View className="  justify-center bg-[#232126] px-4 py-2">
          <Text className="ticket-summary-hero-date-text text-xs font-extrabold uppercase leading-[13px]  tracking-[1px] text-[rgba(255,255,255,0.92)]">
            {dateTime}
          </Text>
        </View>
     
      </View>
      <View className="ticket-summary-hero-info bg-[#232126] px-4 pt-2">
        <Text className="ticket-summary-hero-title pt-1 text-lg font-bold leading-6 text-white">
          {title}
        </Text>

        <View className="mt-2 flex-row items-center justify-between pb-2">
          <Text
            numberOfLines={1}
            className="ticket-summary-hero-venue mr-3 flex-1 text-[13px] font-normal leading-[17px] text-[rgba(255,255,255,0.76)]"
          >
            {venue}
          </Text>

          <View className="shrink-0 flex-row items-center gap-[5px]">
            <Image
              contentFit="contain"
              source={require("../../../assets/ticketx3.png")}
              style={{ height: 15, width: 15 }}
            />
            <Text className="text-[17px] font-bold leading-[19px] text-[#F2F4F7]">
              {`x${ticketCount}`}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onOpenViewer}
        className="ticket-summary-view-button min-h-[42px] flex-row items-center justify-center gap-[6px] bg-[#0444f3]"
        style={bottomSpace ? { marginBottom: bottomSpace } : undefined}
      >
        <Ionicons color="#CFE0FF" name="barcode-outline" size={14} />
        <Text className="ticket-summary-view-button-text text-[13px] font-bold leading-[16px] text-[#F5F9FF]">
          View Tickets
        </Text>
      </Pressable>
    </View>
  );
}
