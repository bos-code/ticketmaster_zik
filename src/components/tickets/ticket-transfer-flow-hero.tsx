import React from 'react';
import { Image } from 'expo-image';
import {
  type LayoutChangeEvent,
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
  getTicketSummaryHeroImageHeight,
  HERO_COLLAPSED_HEIGHT,
} from '@/components/tickets/ticketFlowConstants';
import { useTicketFlowData } from '@/components/tickets/useTicketFlowData';
import { fonts } from '../../../theme/fonts';
import {
  CompactTicketIcon,
  TicketFlowBackIcon,
} from '@/components/tickets/ticket-transfer-flow-icons';

const TICKET_STACK_IMAGE = require('../../../public/ticket-stack.png');
const VIEW_TICKETS_IMAGE = require('../../../public/view-tickets.png');

type CollapsedHeroTitleProps = {
  style: StyleProp<ViewStyle>;
  title: string;
  venue: string;
};

type ExpandedHeroCardProps = {
  dateTime: string;
  onLayout: (event: LayoutChangeEvent) => void;
  onOpenViewer: () => void;
  bottomSpace: number;
  ticketCount: number;
  title: string;
  venue: string;
};

export function CollapsibleEventHero({
  isHeroCollapsed,
  onBack,
  onExpandedHeightChange,
  onOpenViewer,
  scrollY,
  expandedHeight,
}: {
  expandedHeight: number;
  isHeroCollapsed: boolean;
  onBack: () => void;
  onExpandedHeightChange: (height: number) => void;
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
  const heroCollapseDistance = Math.max(
    1,
    expandedHeight - HERO_COLLAPSED_HEIGHT,
  );

  const handleExpandedCardLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      const nextHeight = Math.ceil(
        heroImageBaseHeight + event.nativeEvent.layout.height,
      );

      onExpandedHeightChange(nextHeight);
    },
    [heroImageBaseHeight, onExpandedHeightChange],
  );

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
      style={{ height: expandedHeight }}
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
        style={[{ height: expandedHeight }, expandedLayerStyle]}
      >
        <EdgeToEdgeHeroMedia
          contentFit="cover"
          height={heroImageHeight}
          source={event.heroImage}
        />

        <View style={[absoluteFill, { paddingTop: statusBarBleed }]}>
          <View className='px-[14px]'>
            <View className='mt-3 flex-row items-center justify-between'>
              <HeaderBackButton onBack={onBack} />
              <View className='h-10 w-[60px] items-center justify-center rounded-full bg-black/50'>
                <Text className='text-[14px] font-semibold leading-4 text-white' style={{ fontFamily: fonts.semiBold }}>
                  Help
                </Text>
              </View>
            </View>
          </View>

          <View
            className='absolute inset-x-0 px-[14px]'
            style={{ top: heroImageBaseHeight }}
          >
            <ExpandedHeroCard
              bottomSpace={heroBottomSpace}
              dateTime={event.dateTime}
              onLayout={handleExpandedCardLayout}
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
        <View
          className='justify-center px-[14px]'
          style={{ height: HERO_COLLAPSED_HEIGHT - statusBarBleed }}
        >
          <View className='relative h-10 flex-row items-center justify-between'>
            <HeaderBackButton onBack={onBack} />
            <CollapsedHeroTitle
              style={collapsedTitleStyle}
              title={eventTitle}
              venue={eventVenue}
            />
            {isHeroCollapsed ? (
              <Pressable
                accessibilityLabel='Open tickets'
                accessibilityRole='button'
                hitSlop={8}
                onPress={onOpenViewer}
                className='h-7 w-11 items-center justify-center rounded-[14px] bg-[#0B55F5]'
              >
                <CompactTicketIcon color='#FFFFFF' size={26} />
              </Pressable>
            ) : (
              <View className='h-10 w-[60px] items-center justify-center rounded-full bg-black/50'>
                <Text className='text-[14px] font-semibold leading-4 text-white' style={{ fontFamily: fonts.semiBold }}>
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
      accessibilityLabel='Go back'
      accessibilityRole='button'
      hitSlop={8}
      onPress={onBack}
      className='h-11 w-11 items-center justify-center rounded-full bg-[rgba(0,0,0,0.50)]'
    >
      <TicketFlowBackIcon color='#FFFFFF' size={26} />
    </Pressable>
  );
}

function CollapsedHeroTitle({ style, title, venue }: CollapsedHeroTitleProps) {
  return (
    <Animated.View
      style={[style, { bottom: 0, justifyContent: 'center', pointerEvents: 'none', top: 0 }]}
      className='absolute left-16 right-16 items-center'
    >
      <Text
        numberOfLines={1}
        className='mb-1 text-center text-[13px] font-extrabold uppercase text-white'
        style={{ fontFamily: fonts.extraBold }}
      >
        {title}
      </Text>
      <Text
        numberOfLines={1}
        className='text-center text-[11px] font-normal leading-[13px] text-[rgba(255,255,255,0.84)]'
        style={{ fontFamily: fonts.regular }}
      >
        {venue}
      </Text>
    </Animated.View>
  );
}

function ExpandedHeroCard({
  bottomSpace,
  dateTime,
  onLayout,
  onOpenViewer,
  ticketCount,
  title,
  venue,
}: ExpandedHeroCardProps) {
  return (
    <View
      className="ticket-summary-hero-card relative summary-phone:-top-[.8px] -top-[10px]"
      onLayout={onLayout}
    >
      <View className="absolute left-0 summary-phone:-top-[19.3px] -top-4 z-10 self-start">
        <View className="ticket-summary-hero-date min-h-[33px] justify-center bg-[#232126] px-4 py-2">
          <Text className="ticket-summary-hero-date-text text-[12px] font-extrabold uppercase leading-[14px] tracking-[1.05px] text-[rgba(255,255,255,0.94)]" style={{ fontFamily: fonts.extraBold }}>
            {dateTime}
          </Text>
        </View>
     
      </View>
      <View className="bg-[#232126] px-[14px] pt-2">
        <Text className="ticket-summary-hero-title pt-1 text-[19px] font-extrabold uppercase leading-[24px] text-white" style={{ fontFamily: fonts.extraBold }}>
          {title}
        </Text>

        <View className="mt-2 flex-row items-center justify-between pb-2">
          <Text
            numberOfLines={1}
            className="ticket-summary-hero-venue mr-3 flex-1 text-[14px] font-normal leading-[18px] text-[rgba(255,255,255,0.82)]"
            style={{ fontFamily: fonts.regular }}
          >
            {venue}
          </Text>

          <View className="shrink-0 flex-row items-center gap-[5px]">
            <Image
              accessibilityIgnoresInvertColors
              contentFit="contain"
              source={TICKET_STACK_IMAGE}
              style={{ height: 20, width: 20 }}
            />
            <Text className="text-[17px] font-bold leading-[19px] text-[#F2F4F7]" style={{ fontFamily: fonts.bold }}>
              {`x${ticketCount}`}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        accessibilityLabel="View tickets"
        accessibilityRole="button"
        onPress={onOpenViewer}
        className="ticket-summary-view-button min-h-[44px] flex-row items-center justify-center gap-[7px] bg-[#0561E8]"
        style={bottomSpace ? { marginBottom: bottomSpace } : undefined}
      >
        <Image
          accessibilityIgnoresInvertColors
          contentFit="contain"
          source={VIEW_TICKETS_IMAGE}
          style={{ height: 19, width: 19 }}
        />
        <Text className="ticket-summary-view-button-text text-[14px] font-bold leading-[17px] text-white" style={{ fontFamily: fonts.bold }}>
          View Tickets
        </Text>
      </Pressable>
    </View>
  );
}
