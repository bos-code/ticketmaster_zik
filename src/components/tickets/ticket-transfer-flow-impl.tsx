import {
  selectPrimaryTicketReservation,
  selectTicketReservationById,
  useEventStore,
} from "@/store/use-event-store";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

import {
  buildSeatSummary,
  buildStaticMapPreviewUrl,
  EMPTY_SEATS,
  HERO_COLLAPSE_DISTANCE,
  TicketFlowContext,
  type DeliveryMode,
  type FlowScreen,
  type PanelTab,
  type RecipientFormState,
  type TicketFlowContextValue,
  type TransferModal,
} from "@/components/tickets/ticket-flow-shared";
import { TicketsUnavailable } from "@/components/tickets/ticket-transfer-flow-components";
import { TicketTransferAuthModal } from "@/components/tickets/ticket-transfer-flow-auth-modal";
import { TicketTransferListScreen } from "@/components/tickets/ticket-transfer-flow-list-screen";
import { TicketTransferLoadingModal } from "@/components/tickets/ticket-transfer-flow-loading-modal";
import { TicketTransferRecipientChoiceScreen } from "@/components/tickets/ticket-transfer-flow-recipient-choice-screen";
import { TicketTransferRecipientFormScreen } from "@/components/tickets/ticket-transfer-flow-recipient-form-screen";
import { TicketTransferSelectScreen } from "@/components/tickets/ticket-transfer-flow-select-screen";
import { TicketTransferViewerScreen } from "@/components/tickets/ticket-transfer-flow-viewer-screen";

export function TicketTransferFlow({
  reservationId,
}: {
  reservationId?: string;
}) {
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

  const [screen, setScreen] = useState<FlowScreen>("list");
  const [activePanel, setActivePanel] = useState<PanelTab>("tickets");
  const [isHeroCollapsed, setIsHeroCollapsed] = useState(false);
  const [transferModal, setTransferModal] = useState<TransferModal>("none");
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("email");
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [otpCode, setOtpCode] = useState("");
  const [viewerIndex, setViewerIndex] = useState(Math.max(seats.length - 1, 0));
  const [recipientForm, setRecipientForm] = useState<RecipientFormState>({
    destination: "",
    firstName: "",
    lastName: "",
    note: "",
  });

  const scrollY = useSharedValue(0);
  const heroCollapsedValue = useSharedValue(0);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const transferredSeats = useMemo(() => {
    if (!selectedSeatIds.length) {
      return seats;
    }

    return seats.filter((seat) => selectedSeatIds.includes(seat.id));
  }, [seats, selectedSeatIds]);

  const transferReady =
    recipientForm.firstName.trim().length > 0 &&
    recipientForm.lastName.trim().length > 0 &&
    recipientForm.destination.trim().length > 0;
  const confirmCodeReady = otpCode.length >= 3;

  const handleHeroCollapseChange = useCallback((collapsed: boolean) => {
    setIsHeroCollapsed((current) =>
      current === collapsed ? current : collapsed,
    );
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

  if (!ticketFlowData) {
    return <TicketsUnavailable />;
  }

  const updateRecipientForm = (
    field: keyof RecipientFormState,
    value: string,
  ) => {
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
    router.replace("/(tabs)");
  };

  const handleTransferStart = () => {
    setSelectedSeatIds([]);
    setScreen("select");
  };

  const handleOpenViewer = () => {
    setViewerIndex(Math.max(seats.length - 1, 0));
    setScreen("viewer");
  };

  const handleOpenRecipientForm = (prefill?: Partial<RecipientFormState>) => {
    setRecipientForm((current) => ({
      ...current,
      ...prefill,
    }));
    setScreen("recipientForm");
  };

  const handleToggleDeliveryMode = () => {
    setDeliveryMode((current) => (current === "email" ? "mobile" : "email"));
    updateRecipientForm("destination", "");
  };

  const handleRequestTransfer = () => {
    if (!transferReady) {
      return;
    }

    setOtpCode("");
    setTransferModal("auth");
  };

  const handleConfirmCode = () => {
    if (!confirmCodeReady) {
      return;
    }

    setTransferModal("loading");
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }

    const nextLength = selectedSeatIds.length || seats.length;
    loadingTimerRef.current = setTimeout(() => {
      setTransferModal("none");
      setViewerIndex(Math.max(nextLength - 1, 0));
      setScreen("viewer");
    }, 1200);
  };

  const handleOpenDirections = () => {
    router.push({
      pathname: "/event-directions/[id]",
      params: { id: ticketFlowData.event.id },
    });
  };

  return (
    <TicketFlowContext.Provider value={ticketFlowData}>
      <View className="flex-1">
        <StatusBar style={screen === "viewer" ? "dark" : "light"} />
        <View
          className="mx-auto flex-1 w-full"
          style={{ maxWidth: frameWidth }}
        >
          {screen === "list" || screen === "select" ? (
            <TicketTransferListScreen
              activePanel={activePanel}
              handleListScroll={handleListScroll}
              isHeroCollapsed={isHeroCollapsed}
              onBack={handleBackToTabs}
              onOpenDirections={handleOpenDirections}
              onOpenViewer={handleOpenViewer}
              onPanelChange={setActivePanel}
              onTransfer={handleTransferStart}
              scrollY={scrollY}
            />
          ) : null}

          {screen === "select" ? (
            <TicketTransferSelectScreen
              onBack={() => setScreen("list")}
              onContinue={() => setScreen("recipientChoice")}
              onOpenViewer={handleOpenViewer}
              onToggleSeat={toggleSeat}
              seatSummary={seatSummary}
              seats={seats}
              selectedSeatIds={selectedSeatIds}
              ticketCount={ticketFlowData.order.ticketCount}
            />
          ) : null}

          {screen === "recipientChoice" ? (
            <TicketTransferRecipientChoiceScreen
              onBack={() => setScreen("select")}
              onManualEntry={() =>
                handleOpenRecipientForm({
                  destination: "",
                  firstName: "",
                  lastName: "",
                  note: "",
                })
              }
              onOpenViewer={handleOpenViewer}
              onSelectContact={() =>
                handleOpenRecipientForm({
                  destination: "jaylen@example.com",
                  firstName: "Jaylen",
                  lastName: "Stone",
                  note: "Enjoy the show.",
                })
              }
            />
          ) : null}

          {screen === "recipientForm" ? (
            <TicketTransferRecipientFormScreen
              deliveryMode={deliveryMode}
              form={recipientForm}
              onBack={() => setScreen("recipientChoice")}
              onOpenViewer={handleOpenViewer}
              onRequestTransfer={handleRequestTransfer}
              onToggleDeliveryMode={handleToggleDeliveryMode}
              onUpdateForm={updateRecipientForm}
              transferReady={transferReady}
            />
          ) : null}

          {screen === "viewer" ? (
            <TicketTransferViewerScreen
              carouselCardWidth={carouselCardWidth}
              carouselSnapInterval={carouselSnapInterval}
              onBack={() => setScreen("list")}
              onViewerIndexChange={setViewerIndex}
              seats={transferredSeats}
              viewerIndex={viewerIndex}
            />
          ) : null}
        </View>

        <TicketTransferAuthModal
          confirmCodeReady={confirmCodeReady}
          frameWidth={frameWidth}
          onCancel={() => setTransferModal("none")}
          onConfirm={handleConfirmCode}
          onOtpBackspace={() => setOtpCode((current) => current.slice(0, -1))}
          onOtpDigit={(digit) =>
            setOtpCode((current) =>
              current.length >= 4 ? current : `${current}${digit}`,
            )
          }
          otpCode={otpCode}
          visible={transferModal === "auth"}
        />

        <TicketTransferLoadingModal
          frameWidth={frameWidth}
          visible={transferModal === "loading"}
        />
      </View>
    </TicketFlowContext.Provider>
  );
}
