import {
  selectPrimaryTicketReservation,
  selectTicketReservationById,
  useEventStore,
} from "@/store/use-event-store";
import {
  getSimpleTicketSeatNumbers,
  type TicketRecord,
  useTicketStore,
} from "@/store/ticketStore";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, View, useWindowDimensions } from "react-native";
import * as Contacts from "expo-contacts";
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
import { TicketTransferStatusModal } from "@/components/tickets/TicketTransferStatusModal";
import { ChooseRecipientTypeScreen } from "@/components/tickets/ChooseRecipientTypeScreen";
import { EnterRecipientDetailsScreen } from "@/components/tickets/EnterRecipientDetailsScreen";
import { ChooseTransferMethodScreen } from "@/components/tickets/ChooseTransferMethodScreen";
import { ReviewTransferScreen } from "@/components/tickets/ReviewTransferScreen";

export function TicketTransferFlow({
  reservationId,
  ticketId,
}: {
  reservationId?: string;
  ticketId?: string;
}) {
  const ticket = useTicketStore((state) =>
    ticketId ? state.tickets.find((record) => record.id === ticketId) : undefined,
  );
  const reservation = useEventStore((state) =>
    ticketId
      ? undefined
      : reservationId
      ? selectTicketReservationById(state, reservationId)
      : selectPrimaryTicketReservation(state),
  );
  const { width } = useWindowDimensions();
  const frameWidth = Math.min(width, 430);
  const carouselCardWidth = Math.round(frameWidth * 0.84);
  const carouselGap = 12;
  const carouselSnapInterval = carouselCardWidth + carouselGap;
  const ticketFlowData = useMemo(() => {
    if (ticket) {
      return buildTicketFlowDataFromTicket(ticket);
    }

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
  }, [reservation, ticket]);

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
  const [formErrors, setFormErrors] = useState<Partial<RecipientFormState>>({});

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
  const confirmCodeReady = otpCode.length === 6;

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
    setRecipientForm((current) => {
      const next = {
        ...current,
        [field]: value,
      };

      if (field === "destination") {
        const isEmail = value.includes("@");
        if (isEmail && deliveryMode !== "email") {
          setDeliveryMode("email");
        } else if (!isEmail && value.length > 0 && deliveryMode !== "mobile") {
          setDeliveryMode("mobile");
        }
      }

      // Clear error as user types
      if (formErrors[field]) {
        setFormErrors((curr) => {
          const { [field]: _, ...rest } = curr;
          return rest;
        });
      }

      return next;
    });
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
    setFormErrors({});
    setScreen("recipientForm");
  };

  const handlePickContact = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access contacts was denied");
        return;
      }

      const contact = await Contacts.presentContactPickerAsync();
      if (contact) {
        const firstName = contact.firstName || "";
        const lastName = contact.lastName || "";
        
        const emails = contact.emails || [];
        const phones = contact.phoneNumbers || [];

        const setRecipient = (val: string, mode: DeliveryMode) => {
          setDeliveryMode(mode);
          setRecipientForm({
            destination: val,
            firstName,
            lastName,
            note: "",
          });
          setScreen("recipientForm");
        };

        if (emails.length > 0 && phones.length > 0) {
          Alert.alert(
            "Choose Contact Method",
            `How would you like to send tickets to ${firstName}?`,
            [
              { text: "Email", onPress: () => setRecipient(emails[0].email || "", "email") },
              { text: "Mobile", onPress: () => setRecipient(phones[0].number || "", "mobile") },
              { text: "Cancel", style: "cancel" }
            ]
          );
        } else if (emails.length > 0) {
          setRecipient(emails[0].email || "", "email");
        } else if (phones.length > 0) {
          setRecipient(phones[0].number || "", "mobile");
        } else {
          setRecipient("", "email");
        }
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while picking a contact");
    }
  };

  const handleToggleDeliveryMode = () => {
    setDeliveryMode((current) => (current === "email" ? "mobile" : "email"));
    updateRecipientForm("destination", "");
  };

  const handleRequestTransfer = () => {
    const errors: Partial<RecipientFormState> = {};
    if (!recipientForm.firstName.trim()) errors.firstName = "First name is required";
    if (!recipientForm.lastName.trim()) errors.lastName = "Last name is required";
    
    const dest = recipientForm.destination.trim();
    if (!dest) {
      errors.destination = "Recipient contact is required";
    } else {
      const isEmail = dest.includes("@");
      if (isEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dest)) errors.destination = "Invalid email format";
      } else {
        const phoneRegex = /^\+?[\d\s-]{7,}$/;
        if (!phoneRegex.test(dest)) errors.destination = "Invalid phone format";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
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

    // Simulate API call
    loadingTimerRef.current = setTimeout(() => {
      const isSuccess = Math.random() > 0.1; // 90% success rate

      if (isSuccess) {
        setTransferModal("success");
        // Clear state after success if needed, or navigate
        setTimeout(() => {
          setTransferModal("none");
          const nextLength = selectedSeatIds.length || seats.length;
          setViewerIndex(Math.max(nextLength - 1, 0));
          setScreen("viewer");
        }, 1500);
      } else {
        setTransferModal("error");
      }
    }, 1500);
  };

  const handleRetryTransfer = () => {
    setTransferModal("auth");
    setOtpCode("");
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
              onSelectContact={handlePickContact}
            />
          ) : null}

          {screen === "recipientForm" ? (
            <EnterRecipientDetailsScreen
              deliveryMode={deliveryMode}
              form={recipientForm}
              formErrors={formErrors}
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
              current.length >= 6 ? current : `${current}${digit}`,
            )
          }
          otpCode={otpCode}
          visible={transferModal === "auth"}
        />

        <TicketTransferStatusModal
          frameWidth={frameWidth}
          status={transferModal}
          onRetry={handleRetryTransfer}
          onClose={() => setTransferModal("none")}
        />
      </View>
    </TicketFlowContext.Provider>
  );
}

function buildTicketFlowDataFromTicket(ticket: TicketRecord): TicketFlowContextValue {
  const seats = buildSeatsFromTicket(ticket);

  return {
    event: {
      id: ticket.id,
      title: ticket.eventName,
      shortTitle: ticket.eventName,
      venue: ticket.venue,
      dateTime: `${formatFlowDate(ticket.date)}, ${ticket.time}`,
      headerSubtitle: `${ticket.venue}, ${ticket.city}`,
      imageUrl: ticket.image,
      mapImageUrl: buildStaticMapPreviewUrl(null, null),
    },
    order: {
      id: `Order #${ticket.barcode}`,
      ticketCount: `x${seats.length} Ticket${seats.length === 1 ? "" : "s"}`,
    },
    reservationId: ticket.id,
    seats,
  };
}

function buildSeatsFromTicket(ticket: TicketRecord) {
  const normalizedSeats = getSimpleTicketSeatNumbers(ticket.seatRange);

  return normalizedSeats.map((seat, index) => ({
    id: `${ticket.id}-seat-${index + 1}`,
    note: ticket.perks || ticket.ticketType,
    row: ticket.row,
    seat,
    section: ticket.section,
  }));
}

function formatFlowDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    weekday: "short",
    year: "numeric",
  })
    .format(date)
    .replace(",", "")
    .toUpperCase();
}
