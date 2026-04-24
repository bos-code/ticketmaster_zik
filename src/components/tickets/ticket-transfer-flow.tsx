import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'react-native-qrcode-svg';
import Animated, {
  Easing,
  Extrapolation,
  FadeInDown,
  FadeInUp,
  LinearTransition,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { selectPrimaryTicketReservation, selectTicketReservationById, useEventStore } from '@/store/use-event-store';

type FlowScreen = 'list' | 'select' | 'recipientChoice' | 'recipientForm' | 'viewer';
type PanelTab = 'tickets' | 'extras';
type TransferModal = 'none' | 'auth' | 'loading';
type DeliveryMode = 'email' | 'mobile';

type Seat = {
  id: string;
  note: string;
  seat: string;
  row: string;
  section: string;
};

type RecipientFormState = {
  destination: string;
  firstName: string;
  lastName: string;
  note: string;
};

const EMPTY_SEATS: Seat[] = [];

const EXTRA_CARDS = [
  {
    id: 'entry',
    icon: 'walk-outline' as const,
    title: 'Entry Tips',
    body: 'Bring a charged phone, your active ticket, and a matching photo ID for faster entry.',
  },
  {
    id: 'delivery',
    icon: 'phone-portrait-outline' as const,
    title: 'Mobile Delivery',
    body: 'Tickets stay live in-app and refresh automatically, so screenshots will not be accepted.',
  },
  {
    id: 'policy',
    icon: 'shield-checkmark-outline' as const,
    title: 'Venue Policy',
    body: 'Bag rules and door times can change. Check venue updates before you leave.',
  },
];

const KEYPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'] as const;

const HERO_EXPANDED_HEIGHT = 332;
const HERO_COLLAPSED_HEIGHT = 110;
const HERO_COLLAPSE_DISTANCE = HERO_EXPANDED_HEIGHT - HERO_COLLAPSED_HEIGHT;

const absoluteFill = {
  bottom: 0,
  left: 0,
  position: 'absolute' as const,
  right: 0,
  top: 0,
};

const floatingShadow = {
  elevation: 12,
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 16 },
  shadowOpacity: 0.14,
  shadowRadius: 22,
};

const softPillShadow = {
  elevation: 5,
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.09,
  shadowRadius: 12,
};

function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

type TicketFlowContextValue = {
  event: {
    id: string;
    title: string;
    shortTitle: string;
    venue: string;
    dateTime: string;
    headerSubtitle: string;
    imageUrl: string;
    mapImageUrl: string;
  };
  order: {
    id: string;
    ticketCount: string;
  };
  reservationId: string;
  seats: Seat[];
};

const TicketFlowContext = createContext<TicketFlowContextValue | null>(null);

function useTicketFlowData() {
  const context = useContext(TicketFlowContext);

  if (!context) {
    throw new Error('Ticket flow data is unavailable.');
  }

  return context;
}

export function TicketTransferFlow({ reservationId }: { reservationId?: string }) {
  const reservation = useEventStore((state) =>
    reservationId
      ? selectTicketReservationById(state, reservationId)
      : selectPrimaryTicketReservation(state),
  );
  const { width } = useWindowDimensions();
  const frameWidth = Math.min(width, 430);
  const carouselCardWidth = Math.max(frameWidth - 52, 286);
  const carouselGap = 14;
  const carouselSnapInterval = carouselCardWidth + carouselGap;
  const ticketFlowData = useMemo(() => {
    if (!reservation) {
      return null;
    }

    return {
      event: {
        id: reservation.event.id,
        title: reservation.event.title,
        shortTitle: reservation.event.shortTitle ?? reservation.event.title,
        venue: reservation.event.venue,
        dateTime: reservation.event.date,
        headerSubtitle: reservation.event.venue,
        imageUrl: reservation.event.imageUrl,
        mapImageUrl: buildStaticMapPreviewUrl(
          reservation.event.longitude,
          reservation.event.latitude,
        ),
      },
      order: {
        id: reservation.orderId,
        ticketCount: `x${reservation.ticketCount} Tickets`,
      },
      reservationId: reservation.id,
      seats: reservation.seats.map((seat) => ({
        id: seat.id,
        note: seat.note,
        row: seat.row,
        seat: seat.seat,
        section: seat.section,
      })),
    } satisfies TicketFlowContextValue;
  }, [reservation]);

  const seats = ticketFlowData?.seats ?? EMPTY_SEATS;
  const seatSummary = useMemo(() => buildSeatSummary(seats), [seats]);

  const [screen, setScreen] = useState<FlowScreen>('list');
  const [activePanel, setActivePanel] = useState<PanelTab>('tickets');
  const [isHeroCollapsed, setIsHeroCollapsed] = useState(false);
  const [transferModal, setTransferModal] = useState<TransferModal>('none');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('email');
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [otpCode, setOtpCode] = useState('');
  const [viewerIndex, setViewerIndex] = useState(Math.max(seats.length - 1, 0));
  const [recipientForm, setRecipientForm] = useState<RecipientFormState>({
    destination: '',
    firstName: '',
    lastName: '',
    note: '',
  });

  const scrollY = useSharedValue(0);
  const heroCollapsedValue = useSharedValue(0);
  const viewerListRef = useRef<FlatList<Seat>>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const transferredSeats = useMemo(() => {
    if (!selectedSeatIds.length) {
      return seats;
    }

    return seats.filter((seat) => selectedSeatIds.includes(seat.id));
  }, [seats, selectedSeatIds]);

  const recipientLabel = deliveryMode === 'email' ? 'Email' : 'Mobile Number';
  const recipientPlaceholder =
    deliveryMode === 'email' ? 'Enter Email Address' : 'Enter Mobile Number';
  const transferReady =
    recipientForm.firstName.trim().length > 0 &&
    recipientForm.lastName.trim().length > 0 &&
    recipientForm.destination.trim().length > 0;
  const confirmCodeReady = otpCode.length >= 3;

  const handleHeroCollapseChange = useCallback((collapsed: boolean) => {
    setIsHeroCollapsed((current) => (current === collapsed ? current : collapsed));
  }, []);

  const handleListScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      const nextY = event.contentOffset.y;
      const nextCollapsed = nextY > HERO_COLLAPSE_DISTANCE * 0.58 ? 1 : 0;

      scrollY.value = nextY;

      if (nextCollapsed !== heroCollapsedValue.value) {
        heroCollapsedValue.value = nextCollapsed;
        runOnJS(handleHeroCollapseChange)(nextCollapsed === 1);
      }
    },
  });

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setViewerIndex(Math.max(seats.length - 1, 0));
    setSelectedSeatIds([]);
  }, [seats.length, ticketFlowData?.reservationId]);

  useEffect(() => {
    if (screen !== 'viewer') {
      return;
    }

    requestAnimationFrame(() => {
      viewerListRef.current?.scrollToOffset({
        animated: false,
        offset: viewerIndex * carouselSnapInterval,
      });
    });
  }, [carouselSnapInterval, screen, viewerIndex]);

  if (!ticketFlowData) {
    return <TicketsUnavailable />;
  }

  const updateRecipientForm = (field: keyof RecipientFormState, value: string) => {
    setRecipientForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const toggleSeat = (seatId: string) => {
    setSelectedSeatIds((current) =>
      current.includes(seatId)
        ? current.filter((value) => value !== seatId)
        : [...current, seatId],
    );
  };

  const handleBackToTabs = () => {
    router.replace('/(tabs)');
  };

  const handleTransferStart = () => {
    setSelectedSeatIds([]);
    setScreen('select');
  };

  const handleOpenViewer = () => {
    setViewerIndex(Math.max(seats.length - 1, 0));
    setScreen('viewer');
  };

  const handleOpenRecipientForm = (prefill?: Partial<RecipientFormState>) => {
    setRecipientForm((current) => ({
      ...current,
      ...prefill,
    }));
    setScreen('recipientForm');
  };

  const handleRequestTransfer = () => {
    if (!transferReady) {
      return;
    }

    setOtpCode('');
    setTransferModal('auth');
  };

  const handleConfirmCode = () => {
    if (!confirmCodeReady) {
      return;
    }

    setTransferModal('loading');
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }

    const nextLength = selectedSeatIds.length || seats.length;
    loadingTimerRef.current = setTimeout(() => {
      setTransferModal('none');
      setViewerIndex(Math.max(nextLength - 1, 0));
      setScreen('viewer');
    }, 1200);
  };

  const handleViewerScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / carouselSnapInterval);
    setViewerIndex(Math.max(0, Math.min(transferredSeats.length - 1, nextIndex)));
  };

  const handleOpenDirections = () => {
    router.push({
      pathname: '/event-directions/[id]',
      params: { id: ticketFlowData.event.id },
    });
  };

  return (
    <TicketFlowContext.Provider value={ticketFlowData}>
      <View className="flex-1 bg-[#ECE9E5]">
        <StatusBar style={screen === 'viewer' ? 'dark' : 'light'} />
        <View className="mx-auto flex-1 w-full bg-white" style={{ maxWidth: frameWidth }}>
        {screen === 'list' ? (
          <SafeAreaView edges={['left', 'right']} style={{ flex: 1, backgroundColor: '#F5F2EF' }}>
            <View className="flex-1 overflow-hidden bg-[#F5F2EF]">
              <CollapsibleEventHero
                isHeroCollapsed={isHeroCollapsed}
                onBack={handleBackToTabs}
                onOpenViewer={handleOpenViewer}
                scrollY={scrollY}
              />

              <Animated.ScrollView
                contentContainerStyle={{
                  paddingBottom: 178,
                  paddingTop: HERO_EXPANDED_HEIGHT,
                }}
                onScroll={handleListScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[0]}>
                <PanelTabs activePanel={activePanel} onChange={setActivePanel} />

                {activePanel === 'tickets' ? (
                  <TicketListPanel onOpenDirections={handleOpenDirections} />
                ) : (
                  <ExtrasPanel onOpenDirections={handleOpenDirections} />
                )}
              </Animated.ScrollView>

              <BottomDock onTransfer={handleTransferStart} />
            </View>
          </SafeAreaView>
        ) : null}

        {screen === 'select' ? (
          <TransferScaffold onBack={() => setScreen('list')} onPrimaryPress={handleOpenViewer}>
            <View className="flex-1 bg-white px-[16px] pt-6">
              <Text className="text-center text-[12px] font-medium leading-[15px] text-[#70757E]">
                SELECT TICKETS TRANSFER TICKET
              </Text>

              <View className="mt-10 flex-row items-center justify-between">
                <Text className="text-[12px] font-normal leading-[15px] text-[#444B55]">
                  {seatSummary}
                </Text>
                <Text className="text-[12px] font-normal leading-[15px] text-[#444B55]">
                  {ticketFlowData.order.ticketCount}
                </Text>
              </View>

              <View className="mt-5 flex-row gap-[14px]">
                {seats.map((seat) => {
                  const selected = selectedSeatIds.includes(seat.id);

                  return (
                    <Animated.View
                      key={seat.id}
                      layout={LinearTransition.springify().damping(18).stiffness(160)}>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => toggleSeat(seat.id)}
                        className={cx(
                          'w-16 overflow-hidden rounded-[10px] border bg-white',
                          selected ? 'border-[#1977F3]' : 'border-[#D7DCE4]',
                        )}>
                        <View className="min-h-[30px] items-center justify-center bg-[#1977F3]">
                          <Text className="text-[12px] font-semibold leading-[14px] text-white">
                            {`SEAT ${seat.seat}`}
                          </Text>
                        </View>
                        <View className="min-h-[56px] items-center justify-center bg-white">
                          <View
                            className={cx(
                              'h-[22px] w-[22px] items-center justify-center rounded-full border',
                              selected ? 'border-[#1977F3]' : 'border-[#DBE0E6]',
                            )}>
                            {selected ? <View className="h-3 w-3 rounded-full bg-[#1977F3]" /> : null}
                          </View>
                        </View>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>
            </View>

            <View className="flex-row items-center justify-between px-[16px] pb-[32px] pt-[16px]">
              <Text className="text-[12px] font-normal leading-[14px] text-[#5D6773]">
                {`${selectedSeatIds.length} Selected`}
              </Text>

              <Pressable
                accessibilityRole="button"
                disabled={!selectedSeatIds.length}
                onPress={() => setScreen('recipientChoice')}
                className="flex-row items-center gap-[2px]">
                <Text
                  className={cx(
                    'text-[15px] font-bold leading-[18px]',
                    selectedSeatIds.length ? 'text-[#2A84C6]' : 'text-[#A9C9E6]',
                  )}>
                  TRANSFER TO
                </Text>
                <Ionicons
                  color={selectedSeatIds.length ? '#2A84C6' : '#A9C9E6'}
                  name="chevron-forward"
                  size={17}
                />
              </Pressable>
            </View>
          </TransferScaffold>
        ) : null}

        {screen === 'recipientChoice' ? (
          <TransferScaffold onBack={() => setScreen('select')} onPrimaryPress={handleOpenViewer}>
            <View className="flex-1 items-center px-[18px] pt-[30px]">
              <Text className="mb-7 text-[12px] font-medium leading-[15px] text-[#70757E]">
                TRANSFER TO
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  handleOpenRecipientForm({
                    destination: 'jaylen@example.com',
                    firstName: 'Jaylen',
                    lastName: 'Stone',
                    note: 'Enjoy the show.',
                  })
                }
                className="mb-[10px] h-[38px] w-full flex-row items-center justify-center gap-2 border border-[#86B7D5]">
                <Text className="text-[12px] font-medium leading-[14px] text-[#327CAA]">
                  Select From Contacts
                </Text>
                <Ionicons color="#2A84C6" name="person-add-outline" size={17} />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  handleOpenRecipientForm({
                    destination: '',
                    firstName: '',
                    lastName: '',
                    note: '',
                  })
                }
                className="mb-[10px] h-[38px] w-full flex-row items-center justify-center gap-2 border border-[#86B7D5]">
                <Text className="text-[12px] font-medium leading-[14px] text-[#327CAA]">
                  Manually Enter A Recipient
                </Text>
                <Ionicons color="#2A84C6" name="add-circle-outline" size={17} />
              </Pressable>

              <View className="mt-[78px] items-center justify-center">
                <Ionicons color="#0D0D0D" name="paper-plane-outline" size={54} />
              </View>

              <Text className="mt-4 text-center text-[15px] font-bold leading-5 text-[#242424]">
                Transfer Ticket Via Email or Text Message
              </Text>
              <Text className="mt-4 max-w-[272px] text-center text-[13px] font-normal leading-[18px] text-[#4F5966]">
                Select an email or mobile number to transfer tickets to your recipient.
              </Text>
            </View>

            <View className="px-[14px] pb-[30px]">
              <BackLink onPress={() => setScreen('select')} />
            </View>
          </TransferScaffold>
        ) : null}

        {screen === 'recipientForm' ? (
          <TransferScaffold
            onBack={() => setScreen('recipientChoice')}
            onPrimaryPress={handleOpenViewer}>
            <ScrollView
              contentContainerStyle={{ gap: 10, paddingHorizontal: 14, paddingTop: 20 }}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}>
              <View className="mb-2 h-[3px] w-6 bg-[#121212]" />
              <Text className="mb-2 text-[14px] font-extrabold leading-[18px] text-[#1F1F1F]">
                RECIPIENT DETAILS
              </Text>

              <Field
                label="First Name"
                onChangeText={(value) => updateRecipientForm('firstName', value)}
                placeholder="First Name"
                value={recipientForm.firstName}
              />
              <Field
                label="Last Name"
                onChangeText={(value) => updateRecipientForm('lastName', value)}
                placeholder="Last Name"
                value={recipientForm.lastName}
              />
              <Field
                keyboardType={deliveryMode === 'email' ? 'email-address' : 'phone-pad'}
                label={recipientLabel}
                onChangeText={(value) => updateRecipientForm('destination', value)}
                placeholder={recipientPlaceholder}
                value={recipientForm.destination}
              />

              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setDeliveryMode((current) => (current === 'email' ? 'mobile' : 'email'));
                  updateRecipientForm('destination', '');
                }}
                className="self-start">
                <Text className="text-[12px] font-medium leading-[14px] text-[#4B92BF] underline">
                  {deliveryMode === 'email' ? 'Use Mobile Number instead' : 'Use Email instead'}
                </Text>
              </Pressable>

              <View className="gap-[6px]">
                <Text className="text-[12px] font-semibold leading-[14px] text-[#171717]">
                  Note
                </Text>
                <TextInput
                  multiline
                  numberOfLines={5}
                  onChangeText={(value) => updateRecipientForm('note', value)}
                  style={{ minHeight: 98, textAlignVertical: 'top' }}
                  className="border border-[#C9CCD2] px-[10px] py-2 text-[14px] text-[#111111]"
                  value={recipientForm.note}
                />
              </View>
            </ScrollView>

            <View className="flex-row items-center justify-between px-[14px] pb-[30px] pt-5">
              <BackLink onPress={() => setScreen('recipientChoice')} />

              <Pressable
                accessibilityRole="button"
                disabled={!transferReady}
                onPress={handleRequestTransfer}
                className={cx(
                  'h-10 items-center justify-center rounded-[5px] bg-[#050505] px-[22px]',
                  !transferReady && 'opacity-35',
                )}>
                <Text className="text-[12px] font-semibold leading-[14px] text-white">
                  Transfer Tickets
                </Text>
              </Pressable>
            </View>
          </TransferScaffold>
        ) : null}

        {screen === 'viewer' ? (
          <SafeAreaView edges={['left', 'right']} style={{ flex: 1, backgroundColor: '#F8F4F0' }}>
            <View className="flex-1 bg-[#F8F4F0]">
              <CompactHeroHeader onBack={() => setScreen('list')} />

              <FlatList
                contentContainerStyle={{
                  paddingBottom: 20,
                  paddingLeft: 12,
                  paddingRight: 12,
                  paddingTop: 16,
                }}
                data={transferredSeats}
                decelerationRate="fast"
                getItemLayout={(_, index) => ({
                  index,
                  length: carouselSnapInterval,
                  offset: carouselSnapInterval * index,
                })}
                horizontal
                keyExtractor={(item) => item.id}
                onMomentumScrollEnd={handleViewerScrollEnd}
                ref={viewerListRef}
                renderItem={({ item, index }) => (
                  <TicketCard cardWidth={carouselCardWidth} index={index} seat={item} />
                )}
                showsHorizontalScrollIndicator={false}
                snapToAlignment="start"
                snapToInterval={carouselSnapInterval}
              />

              <Animated.View
                entering={FadeInUp.duration(260)}
                className="mt-auto items-center gap-[18px] px-4 pb-[22px]">
                <View
                  className="min-w-[78px] rounded-[18px] bg-white px-5 py-[9px]"
                  style={softPillShadow}>
                  <Text className="text-center text-[13px] font-bold leading-[15px] text-[#111111]">
                    {`${viewerIndex + 1} of ${transferredSeats.length}`}
                  </Text>
                </View>

                <View className="w-full flex-row justify-between">
                  <Pressable
                    accessibilityRole="button"
                    className="h-[46px] w-[136px] flex-row items-center justify-center gap-2 rounded-[8px] bg-[#111111]">
                    <Ionicons color="#FFFFFF" name="wallet-outline" size={18} />
                    <Text className="text-[12px] font-semibold leading-[14px] text-white">
                      Add to Apple Wallet
                    </Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    className="h-[46px] w-[148px] flex-row items-center justify-center gap-2 rounded-[24px] border border-[#D7DBE2] bg-white">
                    <Ionicons color="#111111" name="information-circle-outline" size={18} />
                    <Text className="text-[12px] font-semibold leading-[14px] text-[#111111]">
                      Ticket Info
                    </Text>
                  </Pressable>
                </View>
              </Animated.View>
            </View>
          </SafeAreaView>
        ) : null}
      </View>

      <Modal animationType="slide" visible={transferModal === 'auth'}>
        <View className="flex-1 items-center bg-white">
          <SafeAreaView edges={['top']} style={{ width: '100%', backgroundColor: '#0863D9' }}>
            <View
              className="min-h-[46px] w-full flex-row items-center bg-[#0863D9] px-[14px]"
              style={{ maxWidth: frameWidth }}>
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setTransferModal('none')}>
                <Text className="text-[14px] font-normal leading-[17px] text-white">Cancel</Text>
              </Pressable>
              <Text className="flex-1 text-center text-[15px] font-bold leading-[18px] text-white">
                Authentication
              </Text>
              <View style={{ minWidth: 42 }} />
            </View>
          </SafeAreaView>

          <View className="flex-1 w-full bg-white pb-[18px]" style={{ maxWidth: frameWidth }}>
            <OtpIllustration />

            <View className="px-[18px] pt-[22px]">
              <Text className="text-[17px] font-bold leading-[21px] text-[#1A1A1A]">
                Authenticate Your Account
              </Text>
              <Text className="mt-[10px] text-[13px] font-normal leading-[18px] text-[#4E5561]">
                A one-time code has been sent to ******2970. Please enter your code below to
                continue.
              </Text>
            </View>

            <View className="gap-2 px-[18px] pt-[18px]">
              <Text className="text-[12px] font-medium leading-[14px] text-[#4A4F58]">
                One-Time Code
              </Text>
              <View className="min-h-9 justify-center rounded-[4px] border border-[#2F88F3] px-3">
                <Text className="text-[18px] font-medium leading-[22px] tracking-[2px] text-[#1A1A1A]">
                  {otpCode}
                </Text>
              </View>
              <Text className="text-[11px] font-normal leading-[13px] text-[#80858E]">
                It may take a minute to receive your code.
              </Text>
            </View>

            <View className="mt-auto flex-row flex-wrap px-[1px] pt-5">
              {KEYPAD_KEYS.map((key) => {
                if (key === '') {
                  return <View key="blank-key" className="h-12 w-1/3" />;
                }

                if (key === 'back') {
                  return (
                    <Pressable
                      accessibilityRole="button"
                      key={key}
                      onPress={() => setOtpCode((current) => current.slice(0, -1))}
                      className="h-12 w-1/3 items-center justify-center border border-[#D8DBE2] bg-white">
                      <Ionicons color="#3B3B3B" name="backspace-outline" size={20} />
                    </Pressable>
                  );
                }

                return (
                  <Pressable
                    accessibilityRole="button"
                    key={key}
                    onPress={() =>
                      setOtpCode((current) => (current.length >= 4 ? current : `${current}${key}`))
                    }
                    className="h-12 w-1/3 items-center justify-center border border-[#D8DBE2] bg-white">
                    <Text className="text-[28px] font-normal leading-[30px] text-[#1A1A1A]">
                      {key}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={!confirmCodeReady}
              onPress={handleConfirmCode}
              className={cx(
                'mx-[18px] mt-4 min-h-10 items-center justify-center',
                confirmCodeReady ? 'bg-[#0863D9]' : 'bg-[#B8D8F6]',
              )}>
              <Text
                className={cx(
                  'text-[13px] font-semibold leading-4',
                  confirmCodeReady ? 'text-white' : 'text-[#F7FBFF]',
                )}>
                Confirm Code
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" transparent={false} visible={transferModal === 'loading'}>
        <View className="flex-1 items-center bg-white">
          <SafeAreaView edges={['top']} style={{ width: '100%', backgroundColor: '#0863D9' }}>
            <View
              className="min-h-[46px] w-full flex-row items-center bg-[#0863D9] px-[14px]"
              style={{ maxWidth: frameWidth }}>
              <View style={{ minWidth: 42 }} />
              <Text className="flex-1 text-center text-[15px] font-bold leading-[18px] text-white">
                Authentication
              </Text>
              <View style={{ minWidth: 42 }} />
            </View>
          </SafeAreaView>

          <View
            className="flex-1 w-full items-center justify-center bg-white"
            style={{ maxWidth: frameWidth }}>
            <ActivityIndicator color="#75A9E8" size="large" />
          </View>
        </View>
      </Modal>
      </View>
    </TicketFlowContext.Provider>
  );
}

function TicketsUnavailable() {
  return (
    <SafeAreaView edges={['left', 'right']} style={{ flex: 1, backgroundColor: '#F5F2EF' }}>
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full max-w-[360px] rounded-[16px] border border-[#E6DFD9] bg-white px-5 py-6">
          <Text className="text-[13px] font-bold uppercase leading-[16px] text-[#0B55F5]">
            My Tickets
          </Text>
          <Text className="mt-3 text-[22px] font-extrabold leading-7 text-[#111111]">
            No reservation is available yet.
          </Text>
          <Text className="mt-3 text-[14px] font-medium leading-5 text-[#5B6470]">
            Reserve a ticket from discovery first, then open it from My Tickets to view the full
            details flow.
          </Text>
          <Pressable
            accessibilityRole="button"
            className="mt-6 min-h-[46px] items-center justify-center rounded-[10px] bg-[#0B55F5]"
            onPress={() => router.replace('/discover')}>
            <Text className="text-[14px] font-semibold leading-[18px] text-white">
              Back to Discover
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function buildStaticMapPreviewUrl(longitude?: number | null, latitude?: number | null) {
  if (typeof longitude !== 'number' || typeof latitude !== 'number') {
    return 'https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=1200&height=700&center=lonlat:-73.9934,40.7505&zoom=14&marker=lonlat:-73.9934,40.7505;type:awesome;color:%23ef4444;size:large';
  }

  return `https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=1200&height=700&center=lonlat:${longitude},${latitude}&zoom=14&marker=lonlat:${longitude},${latitude};type:awesome;color:%23ef4444;size:large`;
}

function buildSeatSummary(seats: Seat[]) {
  if (!seats.length) {
    return 'No ticket seats';
  }

  const firstSeat = seats[0];
  const sameRow = seats.every((seat) => seat.row === firstSeat.row);
  const sameSection = seats.every((seat) => seat.section === firstSeat.section);

  if (sameRow && sameSection) {
    return `Sec ${firstSeat.section}, Row ${firstSeat.row}`;
  }

  if (sameSection) {
    return `Sec ${firstSeat.section}`;
  }

  return `${seats.length} Ticket Seats`;
}

function CollapsibleEventHero({
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
  const heroHeightStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, HERO_COLLAPSE_DISTANCE],
      [HERO_EXPANDED_HEIGHT, HERO_COLLAPSED_HEIGHT],
      Extrapolation.CLAMP,
    ),
  }));

  const expandedContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, HERO_COLLAPSE_DISTANCE * 0.55], [1, 0], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(scrollY.value, [0, HERO_COLLAPSE_DISTANCE], [0, -28], Extrapolation.CLAMP),
      },
    ],
  }));

  const collapsedTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [HERO_COLLAPSE_DISTANCE * 0.28, HERO_COLLAPSE_DISTANCE * 0.8],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(scrollY.value, [0, HERO_COLLAPSE_DISTANCE], [12, 0], Extrapolation.CLAMP),
      },
    ],
  }));

  return (
    <Animated.View
      className="absolute inset-x-0 top-0 z-20 overflow-hidden bg-[#050505]"
      style={heroHeightStyle}>
      <Image contentFit="cover" source={{ uri: event.imageUrl }} style={absoluteFill} />
      <View className="absolute inset-0 bg-[rgba(2,2,4,0.48)]" />
      <View className="absolute inset-x-0 bottom-0 h-24 bg-[rgba(0,0,0,0.18)]" />

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View className="px-4 pt-1">
          <View className="min-h-[42px] flex-row items-center justify-between">
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={onBack}
              className="h-10 w-10 items-center justify-center rounded-full bg-[rgba(0,0,0,0.30)]">
              <Ionicons color="#FFFFFF" name="arrow-back" size={20} />
            </Pressable>

            <Animated.View
              pointerEvents="none"
              style={collapsedTitleStyle}
              className="absolute left-16 right-16 items-center">
              <Text
                numberOfLines={1}
                className="text-center text-[13px] font-extrabold leading-[16px] text-white">
                {event.title}
              </Text>
              <Text
                numberOfLines={1}
                className="mt-[2px] text-center text-[11px] font-normal leading-[13px] text-[rgba(255,255,255,0.84)]">
                {event.venue}
              </Text>
            </Animated.View>

            {isHeroCollapsed ? (
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={onOpenViewer}
                className="h-11 w-11 items-center justify-center rounded-[14px] bg-[#0B55F5]">
                <Ionicons color="#FFFFFF" name="barcode-outline" size={20} />
              </Pressable>
            ) : (
              <Text className="text-[13px] font-medium leading-4 text-white">Help</Text>
            )}
          </View>
        </View>

        <Animated.View style={expandedContentStyle} className="mt-auto px-4 pb-0">
          <View className="overflow-hidden bg-[rgba(20,20,24,0.94)]">
            <View className="px-4 pt-4">
              <View className="self-start bg-[#232126] px-4 py-[10px]">
                <Text
                  className="text-[11px] font-extrabold uppercase leading-[13px] text-[rgba(255,255,255,0.92)]"
                  style={{ letterSpacing: 1 }}>
                  {event.dateTime}
                </Text>
              </View>

              <Text className="mt-4 text-[18px] font-extrabold leading-6 text-white">
                {event.title}
              </Text>

              <View className="mt-4 flex-row items-center justify-between pb-4">
                <Text className="text-[13px] font-normal leading-[17px] text-[rgba(255,255,255,0.76)]">
                  {event.venue}
                </Text>

                <View className="flex-row items-center gap-[5px]">
                  <Ionicons color="#E6E8EC" name="ticket-outline" size={15} />
                  <Text className="text-[17px] font-bold leading-[19px] text-[#F2F4F7]">
                    {order.ticketCount.replace(' Tickets', '')}
                  </Text>
                </View>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={onOpenViewer}
              className="min-h-[68px] flex-row items-center justify-center gap-3 bg-[#0B55F5]">
              <Ionicons color="#CFE0FF" name="barcode-outline" size={18} />
              <Text className="text-[15px] font-bold leading-[18px] text-[#F5F9FF]">
                View Tickets
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}

function PanelTabs({
  activePanel,
  onChange,
}: {
  activePanel: PanelTab;
  onChange: (value: PanelTab) => void;
}) {
  return (
    <View className="border-b border-[#ECE6E3] bg-white">
      <View className="flex-row">
        <PanelTabButton
          active={activePanel === 'tickets'}
          label="Tickets"
          onPress={() => onChange('tickets')}
        />
        <PanelTabButton
          active={activePanel === 'extras'}
          label="Extras"
          onPress={() => onChange('extras')}
        />
      </View>
    </View>
  );
}

function PanelTabButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-1 items-center justify-center border-b-[3px] py-4"
      style={{ borderBottomColor: active ? '#111111' : 'transparent' }}>
      <Text
        className={cx(
          'text-[15px] leading-[18px]',
          active ? 'font-bold text-[#111111]' : 'font-medium text-[#757575]',
        )}>
        {label}
      </Text>
    </Pressable>
  );
}

function TicketListPanel({
  onOpenDirections,
}: {
  onOpenDirections: () => void;
}) {
  const { order, seats } = useTicketFlowData();

  return (
    <View className="bg-white pb-4">
      <View className="border-b border-[#F1ECE8] px-5 py-6">
        <View className="flex-row items-start justify-between">
          <View className="gap-[6px]">
            <Text className="text-[17px] font-extrabold leading-[22px] text-[#141414]">
              {order.id}
            </Text>
            <Text className="text-[13px] font-medium leading-[17px] text-[#6D727A]">
              {order.ticketCount}
            </Text>
          </View>

          <Pressable accessibilityRole="button" className="h-9 w-9 items-center justify-center">
            <Ionicons color="#1E1E1E" name="ellipsis-vertical" size={18} />
          </Pressable>
        </View>
      </View>

      <View className="gap-4 px-4 pb-1 pt-4">
        {seats.map((seat, index) => (
          <TicketSeatCard index={index} key={seat.id} seat={seat} />
        ))}
      </View>

      <MapPreviewCard onOpenDirections={onOpenDirections} />
      <PromoCard />
    </View>
  );
}

function TicketSeatCard({
  index,
  seat,
}: {
  index: number;
  seat: Seat;
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(220).delay(40 + index * 60)}
      className="overflow-hidden rounded-[4px] border border-[#F0EAE6] bg-[#F7F4F2] px-4 py-5">
      <Text className="text-[15px] font-semibold leading-[19px] text-[#111111]">{seat.note}</Text>

      <View className="mt-[20px] flex-row justify-between gap-3">
        <TicketMetaCell label="SECTION" value={seat.section} />
        <TicketMetaCell label="ROW" value={seat.row} />
        <TicketMetaCell align="right" label="SEAT" value={seat.seat} />
      </View>
    </Animated.View>
  );
}

function MapPreviewCard({
  onOpenDirections,
}: {
  onOpenDirections: () => void;
}) {
  const { event } = useTicketFlowData();

  return (
    <Animated.View entering={FadeInUp.duration(240)} className="mx-4 mt-5 overflow-hidden bg-[#F4F1EE]">
      <View className="relative">
        <Image contentFit="cover" source={{ uri: event.mapImageUrl }} style={{ height: 252, width: '100%' }} />

        <View className="absolute inset-0 items-center justify-center">
          <Ionicons color="#F3182E" name="location" size={42} />
          <View className="mt-1 rounded-full bg-[rgba(255,255,255,0.93)] px-3 py-[6px]">
            <Text className="text-[12px] font-semibold leading-[15px] text-[#1A1A1A]">
              {event.venue}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        className="min-h-[62px] items-center justify-center bg-[#F4F1EE]"
        onPress={onOpenDirections}>
        <Text className="text-[18px] font-bold leading-[22px] text-[#141414]">Get Directions</Text>
      </Pressable>
    </Animated.View>
  );
}

function PromoCard() {
  const { event } = useTicketFlowData();

  return (
    <Animated.View entering={FadeInUp.duration(280)} className="mx-4 mt-5 overflow-hidden bg-black">
      <Image contentFit="cover" source={{ uri: event.imageUrl }} style={{ height: 190, width: '100%' }} />
      <View className="absolute inset-0 bg-[rgba(7,7,9,0.52)]" />

      <View className="absolute inset-0 px-4 py-4">
        <Text className="ml-auto text-right text-[28px] font-black leading-7 text-white">
          YOU GOT{'\n'}TICKETS!
        </Text>

        <View className="mt-auto max-w-[220px]">
          <View className="self-start bg-[rgba(20,20,24,0.88)] px-3 py-[8px]">
            <Text
              className="text-[10px] font-extrabold uppercase leading-3 text-[rgba(255,255,255,0.9)]"
              style={{ letterSpacing: 0.8 }}>
              {event.dateTime}
            </Text>
          </View>

          <View className="mt-2 bg-[rgba(20,20,24,0.94)] px-3 py-3">
            <Text className="text-[15px] font-extrabold leading-[18px] text-white">
              {event.title}
            </Text>
            <Text className="mt-2 text-[12px] font-medium leading-[15px] text-[rgba(255,255,255,0.74)]">
              {event.venue}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

function ExtrasPanel({
  onOpenDirections,
}: {
  onOpenDirections: () => void;
}) {
  return (
    <View className="bg-white px-4 pb-10 pt-5">
      <View className="gap-3">
        {EXTRA_CARDS.map((card) => (
          <View
            className="rounded-[4px] border border-[#EFE8E3] bg-[#F8F5F3] px-4 py-4"
            key={card.id}>
            <View className="flex-row items-start gap-3">
              <View className="mt-[2px] h-9 w-9 items-center justify-center rounded-full bg-white">
                <Ionicons color="#0F56F4" name={card.icon} size={18} />
              </View>

              <View className="flex-1 gap-1">
                <Text className="text-[15px] font-bold leading-[18px] text-[#161616]">
                  {card.title}
                </Text>
                <Text className="text-[13px] font-normal leading-[18px] text-[#5B6470]">
                  {card.body}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <MapPreviewCard onOpenDirections={onOpenDirections} />
    </View>
  );
}

function CompactHeroHeader({
  onBack,
  onOpenViewer,
}: {
  onBack: () => void;
  onOpenViewer?: () => void;
}) {
  const { event } = useTicketFlowData();

  return (
    <View className="overflow-hidden bg-[#050505]">
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#050505' }}>
        <View className="relative min-h-[106px] overflow-hidden">
          <Image contentFit="cover" source={{ uri: event.imageUrl }} style={absoluteFill} />
          <View className="absolute inset-0 bg-[rgba(3,3,6,0.56)]" />

          <View className="relative flex-1 justify-center px-4">
            <View className="min-h-[44px] flex-row items-center justify-between">
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={onBack}
                className="h-10 w-10 items-center justify-center rounded-full bg-[rgba(0,0,0,0.30)]">
                <Ionicons color="#FFFFFF" name="arrow-back" size={20} />
              </Pressable>

              <View className="absolute left-14 right-14 items-center">
                <Text
                  numberOfLines={1}
                  className="text-center text-[13px] font-extrabold leading-[16px] text-white">
                  {event.title}
                </Text>
                <Text
                  numberOfLines={1}
                  className="mt-[2px] text-center text-[11px] font-normal leading-[13px] text-[rgba(255,255,255,0.84)]">
                  {event.venue}
                </Text>
              </View>

              {onOpenViewer ? (
                <Pressable
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={onOpenViewer}
                  className="h-11 w-11 items-center justify-center rounded-[14px] bg-[#0B55F5]">
                  <Ionicons color="#FFFFFF" name="barcode-outline" size={20} />
                </Pressable>
              ) : (
                <View className="h-10 w-10" />
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function TransferScaffold({
  children,
  onBack,
  onPrimaryPress,
}: {
  children: React.ReactNode;
  onBack: () => void;
  onPrimaryPress: () => void;
}) {
  return (
    <SafeAreaView edges={['left', 'right']} style={{ flex: 1, backgroundColor: '#F5F2EF' }}>
      <View className="flex-1 bg-[#F5F2EF]">
        <CompactHeroHeader onBack={onBack} onOpenViewer={onPrimaryPress} />
        <View className="flex-1 bg-white">{children}</View>
      </View>
    </SafeAreaView>
  );
}

function TicketMetaCell({
  align = 'left',
  label,
  value,
}: {
  align?: 'left' | 'right';
  label: string;
  value: string;
}) {
  return (
    <View className={cx('flex-1', align === 'right' && 'items-end')}>
      <Text
        className={cx(
          'text-[11px] font-bold leading-[13px] text-[#999BA0]',
          align === 'right' && 'text-right',
        )}
        style={{ letterSpacing: 0.8 }}>
        {label}
      </Text>
      <Text
        className={cx(
          'mt-[10px] text-[17px] font-bold leading-[21px] text-[#111111]',
          align === 'right' && 'text-right',
        )}>
        {value}
      </Text>
    </View>
  );
}

function BottomDock({ onTransfer }: { onTransfer: () => void }) {
  return (
    <Animated.View
      entering={FadeInUp.duration(320).delay(220)}
      pointerEvents="box-none"
      className="absolute inset-x-0 bottom-[22px] z-30 items-center">
      <View
        className="overflow-hidden rounded-[30px] border border-[#ECE7E3] bg-white"
        style={[floatingShadow, { minWidth: 232 }]}>
        <View className="flex-row items-center">
          <Pressable
            accessibilityRole="button"
            className="min-h-[62px] min-w-[116px] items-center justify-center gap-[2px] border-r border-[#EFEAE7]"
            onPress={onTransfer}>
            <Ionicons color="#2B72D7" name="arrow-up-outline" size={16} />
            <Text className="text-[12px] font-medium leading-[15px] text-[#2B72D7]">
              Transfer
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            className="min-h-[62px] min-w-[116px] items-center justify-center gap-[2px]"
            disabled>
            <Ionicons color="#D1D5DB" name="pricetag-outline" size={16} />
            <Text className="text-[12px] font-medium leading-[15px] text-[#D1D5DB]">Sell</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

function BackLink({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" className="flex-row items-center gap-[2px]" onPress={onPress}>
      <Ionicons color="#2A84C6" name="chevron-back" size={17} />
      <Text className="text-[12px] font-medium leading-[14px] text-[#2A84C6]">BACK</Text>
    </Pressable>
  );
}

function Field({
  keyboardType,
  label,
  onChangeText,
  placeholder,
  value,
}: {
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View className="gap-[6px]">
      <Text className="text-[12px] font-semibold leading-[14px] text-[#171717]">{label}</Text>
      <TextInput
        className="min-h-[36px] border border-[#C9CCD2] px-[10px] py-2 text-[14px] text-[#111111]"
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#C4C8CE"
        value={value}
      />
    </View>
  );
}

function OtpIllustration() {
  return (
    <View className="relative min-h-[178px] items-center justify-center overflow-hidden bg-[#181823]">
      <View className="relative min-h-[88px] min-w-[190px] items-center justify-center rounded-[34px] bg-white px-[22px]">
        <View className="flex-row gap-[7px]">
          {[0, 1, 2, 3].map((index) => (
            <View
              className={cx(
                'h-[34px] w-[34px] items-center justify-center rounded-[6px] bg-[#0A6AE4]',
                index === 3 && 'opacity-80',
              )}
              key={index}>
              {index < 3 ? (
                <Text className="text-[20px] font-extrabold leading-[22px] text-white">*</Text>
              ) : null}
            </View>
          ))}
        </View>
        <View
          className="absolute left-7 h-5 w-5 rounded-bl-[10px] bg-white"
          style={{ bottom: -12, transform: [{ rotate: '32deg' }] }}
        />
      </View>

      <View className="absolute right-[70px] top-[68px]">
        <View
          className="h-5 w-5 self-center border-x-4 border-t-4 border-[#F3C746]"
          style={{
            borderBottomWidth: 0,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        />
        <View className="-mt-[2px] h-[34px] w-[30px] items-center justify-center rounded-[8px] bg-[#F8D65B]">
          <Ionicons color="#D7A311" name="lock-closed" size={18} />
        </View>
      </View>
    </View>
  );
}

function TicketCard({
  cardWidth,
  index,
  seat,
}: {
  cardWidth: number;
  index: number;
  seat: Seat;
}) {
  const { event } = useTicketFlowData();

  return (
    <Animated.View
      entering={FadeInDown.duration(280).delay(40 + index * 70)}
      className="mr-[14px] overflow-hidden rounded-[10px] border border-[#E6DFD9] bg-[#FBF8F5]"
      style={{ width: cardWidth }}>
      <View className="h-[10px] bg-[#0458F7]" />

      <View className="bg-white px-[10px] pt-2">
        <View className="mb-2 flex-row items-center justify-center">
          <Text className="mr-1 text-[11px] font-medium leading-[14px] text-[#6B6B6B]">
            Screenshots won&apos;t get you in
          </Text>
          <Ionicons color="#5A5A5A" name="refresh-outline" size={12} />
        </View>
        <TicketQrBand seat={seat} />
      </View>

      <Image contentFit="cover" source={{ uri: event.imageUrl }} style={{ height: 300, width: '100%' }} />

      <View className="px-[14px] pb-[14px] pt-3">
        <Text className="text-[17px] font-bold leading-5 text-[#202020]">{seat.note}</Text>
        <Text className="mt-[3px] text-[12px] font-medium leading-[15px] text-[#8B8F96]">
          LOWER BOWL SEATING
        </Text>

        <View className="mt-[14px]">
          <Text className="text-[10px] font-bold leading-3 text-[#A7ACB5]">SECTION</Text>
          <Text className="mt-[10px] text-[18px] font-extrabold leading-[22px] text-[#0F0F0F]">
            {seat.section}
          </Text>
        </View>

        <View className="mt-[14px] min-h-[48px] items-center justify-center bg-[#0D0D0D]">
          <Text className="text-[15px] font-bold leading-[19px] text-white">
            LOWER BOWL SEATING
          </Text>
        </View>

        <Text className="mt-[14px] text-[12px] font-medium leading-4 text-[#8B8F96]">
          {`ROW ${seat.row}   -   SEAT ${seat.seat}`}
        </Text>
      </View>
    </Animated.View>
  );
}

function TicketQrBand({ seat }: { seat: Seat }) {
  const { event } = useTicketFlowData();
  const qrValue = `${event.shortTitle}-${seat.section}-${seat.row}-${seat.seat}`;
  const beamProgress = useSharedValue(0);

  useEffect(() => {
    beamProgress.value = withRepeat(
      withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [beamProgress]);

  const beamAnimatedStyle = useAnimatedStyle(() => {
    const seatBias = seat.seat === '2' ? -18 : seat.seat === '4' ? 18 : 0;

    return {
      transform: [
        {
          translateX: interpolate(beamProgress.value, [0, 1], [-34 + seatBias, 34 + seatBias]),
        },
      ],
    };
  });

  return (
    <View className="relative h-16 flex-row items-center overflow-hidden bg-white">
      <View className="mr-1 h-[42px] w-[3px] bg-[#2E66F5]" />

      <View className="gap-[2px] py-[7px]">
        <View className="h-[38px] w-[5px] bg-[#101010]" />
        <View className="h-[38px] w-[2px] bg-[#101010]" />
        <View className="h-[38px] w-[2px] bg-[#101010]" />
      </View>

      <View className="flex-1 flex-row justify-center gap-[2px] px-[6px]">
        {[0, 1, 2].map((index) => (
          <View className="overflow-hidden bg-white" key={index}>
            <QRCode
              backgroundColor="#FFFFFF"
              color="#111111"
              quietZone={0}
              size={40}
              value={`${qrValue}-${index}`}
            />
          </View>
        ))}
      </View>

      <Animated.View
        className="absolute top-[10px] h-[44px] w-[6px] bg-[#2E66F5] opacity-90"
        style={[{ left: '50%' }, beamAnimatedStyle]}
      />

      <View className="gap-[2px] py-[7px]">
        <View className="h-[38px] w-[5px] bg-[#101010]" />
        <View className="h-[38px] w-[2px] bg-[#101010]" />
        <View className="h-[38px] w-[2px] bg-[#101010]" />
      </View>
    </View>
  );
}
