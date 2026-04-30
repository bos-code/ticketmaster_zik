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
  type DeliveryMode,
  type FlowScreen,
  type PanelTab,
  type RecipientFormState,
  type TicketFlowContextValue,
  type TransferModal,
} from "@/components/tickets/ticketFlowTypes";
import { buildSeatSummary } from "@/components/tickets/buildSeatSummary";
import { buildStaticMapPreviewUrl } from "@/components/tickets/buildStaticMapPreviewUrl";
import { TicketFlowContext } from "@/components/tickets/TicketFlowContext";
import { EMPTY_SEATS, HERO_COLLAPSE_DISTANCE } from "@/components/tickets/ticketFlowConstants";
import { TicketsUnavailable } from "@/components/tickets/ticket-transfer-flow-components";
import { TicketTransferAuthModal } from "@/components/tickets/ticket-transfer-flow-auth-modal";
import { SelectTicketsScreen } from "@/components/tickets/SelectTicketsScreen";
import { TicketTransferLoadingModal } from "@/components/tickets/ticket-transfer-flow-loading-modal";
import { ChooseRecipientTypeScreen } from "@/components/tickets/ChooseRecipientTypeScreen";
import { EnterRecipientDetailsScreen } from "@/components/tickets/EnterRecipientDetailsScreen";
import { ChooseTransferMethodScreen } from "@/components/tickets/ChooseTransferMethodScreen";
import { ReviewTransferScreen } from "@/components/tickets/ReviewTransferScreen";

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
  const carouselCardWidth = Math.round(frameWidth * 0.84);
  const carouselGap = 12;
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
        <StatusBar
          backgroundColor={screen === "viewer" ? "#FFFFFF" : "#000000"}
          style={screen === "viewer" ? "dark" : "light"}
        />
        <View
          className="mx-auto flex-1 w-full"
          style={{ maxWidth: frameWidth }}
        >
          {["list", "select", "recipientChoice", "recipientForm"].includes(screen) ? (
            <SelectTicketsScreen
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
            <ChooseTransferMethodScreen
              onBack={() => setScreen("list")}
              onContinue={() => setScreen("recipientChoice")}
              onToggleSeat={toggleSeat}
              seatSummary={seatSummary}
              seats={seats}
              selectedSeatIds={selectedSeatIds}
              ticketCount={ticketFlowData.order.ticketCount}
            />
          ) : null}

          {screen === "recipientChoice" ? (
            <ChooseRecipientTypeScreen
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
            <EnterRecipientDetailsScreen
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
            <ReviewTransferScreen
              carouselCardWidth={carouselCardWidth}
              carouselSnapInterval={carouselSnapInterval}
              onBack={() => setScreen("list")}
              onOpenDirections={handleOpenDirections}
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
