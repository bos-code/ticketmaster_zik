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
  getTicketFlowHorizontalGutter,
  getTicketSummaryHeroImageHeight,
  getTicketSummaryViewButtonHeight,
  scaleTicketReferenceMetric,
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
  horizontalGutter: number;
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
  const horizontalGutter = getTicketFlowHorizontalGutter(width);
  const viewButtonHeight = getTicketSummaryViewButtonHeight(width);
  const headerTopMargin = scaleTicketReferenceMetric(width, 15, 8, 9);
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
        horizontalGutter={horizontalGutter}
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
          <View style={{ paddingHorizontal: horizontalGutter }}>
            <View
              className='flex-row items-center justify-between'
              style={{ marginTop: headerTopMargin }}
            >
              <HeaderBackButton onBack={onBack} />
              <HeaderHelpButton />
            </View>
          </View>

          <View
            className='absolute inset-x-0'
            style={{ paddingHorizontal: horizontalGutter, top: heroImageBaseHeight }}
          >
            <ExpandedHeroCard
              bottomSpace={heroBottomSpace}
              dateTime={event.dateTime}
              horizontalGutter={horizontalGutter}
              onLayout={handleExpandedCardLayout}
              onOpenViewer={onOpenViewer}
              ticketCount={order.ticketCount}
              title={event.title}
              venue={event.venue}
              viewButtonHeight={viewButtonHeight}
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
  horizontalGutter,
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
  horizontalGutter: number;
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
          className='justify-center'
          style={{
            height: HERO_COLLAPSED_HEIGHT - statusBarBleed,
            paddingHorizontal: horizontalGutter,
          }}
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
              <HeaderHelpButton />
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

function HeaderBackButton({ onBack }: { onBack: () => void }) {
  const { width } = useWindowDimensions();
  const diameter = scaleTicketReferenceMetric(width, 52, 26, 31);
  const iconSize = Math.round(diameter * 0.55);

  return (
    <Pressable
      accessibilityLabel='Go back'
      accessibilityRole='button'
      hitSlop={8}
      onPress={onBack}
      className='items-center justify-center rounded-full bg-[rgba(0,0,0,0.50)]'
      style={{ height: diameter, width: diameter }}
    >
      <TicketFlowBackIcon color='#FFFFFF' size={iconSize} />
    </Pressable>
  );
}

function HeaderHelpButton() {
  const { width } = useWindowDimensions();
  const buttonWidth = scaleTicketReferenceMetric(width, 116, 58, 68);
  const buttonHeight = scaleTicketReferenceMetric(width, 47, 24, 28);
  const fontSize = scaleTicketReferenceMetric(width, 19, 10, 11);

  return (
    <View
      className='items-center justify-center rounded-full bg-black/50'
      style={{ height: buttonHeight, width: buttonWidth }}
    >
      <Text
        className='font-semibold text-white'
        style={{ fontFamily: fonts.semiBold, fontSize }}
      >
        Help
      </Text>
    </View>
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
  horizontalGutter,
  onLayout,
  onOpenViewer,
  ticketCount,
  title,
  venue,
  viewButtonHeight,
}: ExpandedHeroCardProps & { viewButtonHeight: number }) {
  const { width } = useWindowDimensions();
  const dateHeight = scaleTicketReferenceMetric(width, 37, 20, 22);
  const dateFontSize = scaleTicketReferenceMetric(width, 16, 10, 11);
  const datePaddingHorizontal = scaleTicketReferenceMetric(width, 17, 9, 10);
  const titleFontSize = scaleTicketReferenceMetric(width, 31, 16, 18);
  const detailPanelHeight = scaleTicketReferenceMetric(width, 176, 88, 103);
  const venueFontSize = scaleTicketReferenceMetric(width, 20, 11, 12);
  const countFontSize = scaleTicketReferenceMetric(width, 24, 13, 14);
  const viewFontSize = scaleTicketReferenceMetric(width, 21, 11, 13);

  return (
    <View
      className="ticket-summary-hero-card relative summary-phone:-top-[.8px] -top-[10px]"
      onLayout={onLayout}
    >
      <View className="absolute left-0 summary-phone:-top-[19.3px] -top-4 z-10 self-start">
        <View
          className="ticket-summary-hero-date justify-center bg-[#232126]"
          style={{ height: dateHeight, paddingHorizontal: datePaddingHorizontal }}
        >
          <Text
            className="ticket-summary-hero-date-text font-extrabold uppercase tracking-[1.05px] text-[rgba(255,255,255,0.94)]"
            style={{ fontFamily: fonts.extraBold, fontSize: dateFontSize, lineHeight: dateFontSize + 2 }}
          >
            {dateTime}
          </Text>
        </View>
     
      </View>
      <View
        className="bg-[#232126] pt-2"
        style={{ height: detailPanelHeight, paddingHorizontal: horizontalGutter }}
      >
        <Text
          className="ticket-summary-hero-title pt-1 font-extrabold uppercase text-white"
          style={{ fontFamily: fonts.extraBold, fontSize: titleFontSize, lineHeight: titleFontSize + 5 }}
        >
          {title}
        </Text>

        <View className="mt-2 flex-row items-center justify-between pb-2">
          <Text
            numberOfLines={1}
            className="ticket-summary-hero-venue mr-3 flex-1 font-normal text-[rgba(255,255,255,0.82)]"
            style={{ fontFamily: fonts.regular, fontSize: venueFontSize, lineHeight: venueFontSize + 4 }}
          >
            {venue}
          </Text>

          <View className="shrink-0 flex-row items-center gap-[5px]">
            <Image
              accessibilityIgnoresInvertColors
              contentFit="contain"
              source={TICKET_STACK_IMAGE}
              style={{ height: 28, width: 28 }}
            />
            <Text
              className="font-bold text-[#F2F4F7]"
              style={{ fontFamily: fonts.bold, fontSize: countFontSize, lineHeight: countFontSize + 2 }}
            >
              {`x${ticketCount}`}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        accessibilityLabel="View tickets"
        accessibilityRole="button"
        onPress={onOpenViewer}
        className="ticket-summary-view-button flex-row items-center justify-center gap-[7px] bg-[#0561E8]"
        style={{ height: viewButtonHeight, marginBottom: bottomSpace }}
      >
        <Image
          accessibilityIgnoresInvertColors
          contentFit="contain"
          source={VIEW_TICKETS_IMAGE}
          style={{ height: 32, width: 32 }}
        />
        <Text
          className="ticket-summary-view-button-text font-bold text-white"
          style={{ fontFamily: fonts.bold, fontSize: viewFontSize, lineHeight: viewFontSize + 3 }}
        >
          View Tickets
        </Text>
      </Pressable>
    </View>
  );
}
