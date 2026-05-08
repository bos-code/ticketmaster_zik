import * as Contacts from "expo-contacts";
import { type Href, router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, View, useWindowDimensions } from "react-native";
import {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

import { buildSeatSummary } from "@/components/tickets/buildSeatSummary";
import { ChooseRecipientTypeScreen } from "@/components/tickets/ChooseRecipientTypeScreen";
import { ChooseTransferMethodScreen } from "@/components/tickets/ChooseTransferMethodScreen";
import { EnterRecipientDetailsScreen } from "@/components/tickets/EnterRecipientDetailsScreen";
import { ReviewTransferScreen } from "@/components/tickets/ReviewTransferScreen";
import { SelectTicketsScreen } from "@/components/tickets/SelectTicketsScreen";
import { StatusBarChrome } from "@/components/status-bar-chrome";
import { TicketTransferAuthModal } from "@/components/tickets/ticket-transfer-flow-auth-modal";
import { TicketsUnavailable } from "@/components/tickets/ticket-transfer-flow-components";
import {
  EMPTY_SEATS,
  HERO_COLLAPSE_DISTANCE,
} from "@/components/tickets/ticketFlowConstants";
import { TicketFlowContext } from "@/components/tickets/TicketFlowContext";
import {
  type DeliveryMode,
  type FlowScreen,
  type PanelTab,
  type RecipientFormState,
  type TicketFlowContextValue,
  type TransferModal,
} from "@/components/tickets/ticketFlowTypes";
import { TicketTransferStatusModal } from "@/components/tickets/TicketTransferStatusModal";
import { useTicketOrder } from "@/hooks/useTicketOrder";
import type { TicketOrderData, TicketSummaryViewModel } from "@/types/ticket";

export function TicketTransferFlow({
  initialScreen = "list",
  initialTicketIndex = 0,
  orderId,
}: {
  initialScreen?: "list" | "viewer";
  initialTicketIndex?: number;
  orderId?: string;
}) {
  const {
    ticketOrder,
    summaryViewModel,
    getDetailsViewModel,
  } =
    useTicketOrder(orderId);
  const { width } = useWindowDimensions();
  const frameWidth = Math.min(width, 430);
  const carouselCardWidth = Math.round(frameWidth * 0.84);
  const carouselGap = 12;
  const carouselSnapInterval = carouselCardWidth + carouselGap;
  const initialViewerIndex = useMemo(
    () => getDetailsViewModel(initialTicketIndex).activeIndex,
    [getDetailsViewModel, initialTicketIndex],
  );
  const ticketFlowData = useMemo(
    () => buildTicketFlowDataFromOrder(ticketOrder, summaryViewModel),
    [summaryViewModel, ticketOrder],
  );

  const seats = ticketFlowData?.seats ?? EMPTY_SEATS;
  const seatSummary = useMemo(() => buildSeatSummary(seats), [seats]);

  const [screen, setScreen] = useState<FlowScreen>(initialScreen);
  const [activePanel, setActivePanel] = useState<PanelTab>("tickets");
  const [isHeroCollapsed, setIsHeroCollapsed] = useState(false);
  const [transferModal, setTransferModal] = useState<TransferModal>("none");
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("email");
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [otpCode, setOtpCode] = useState("");
  const [viewerIndex, setViewerIndex] = useState(initialViewerIndex);
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
  const activeTicketDetails = useMemo(
    () => getDetailsViewModel(viewerIndex),
    [getDetailsViewModel, viewerIndex],
  );

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
    setScreen(initialScreen);
    setViewerIndex(initialViewerIndex);
    setSelectedSeatIds([]);
  }, [initialScreen, initialViewerIndex, seats.length, ticketFlowData?.orderId]);

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
    router.replace("/my-tickets");
  };

  const buildTicketSummaryHref = useCallback(
    (nextOrderId: string): Href =>
      ({
        pathname: "/tickets",
        params: { orderId: nextOrderId },
      }) as unknown as Href,
    [],
  );

  const openTicketDetailsRoute = useCallback(
    (ticketIndex: number) => {
      const nextDetails = getDetailsViewModel(ticketIndex);

      router.push({
        pathname: "/tickets/[orderId]",
        params: {
          orderId: ticketOrder.order.id,
          ticketIndex: String(nextDetails.activeIndex),
        },
      });
    },
    [getDetailsViewModel, ticketOrder.order.id],
  );

  const handleTransferStart = () => {
    setSelectedSeatIds([]);
    setScreen("select");
  };

  const handleOpenViewer = () => {
    openTicketDetailsRoute(0);
  };

  const handleViewerBack = () => {
    if (initialScreen === "viewer") {
      if (router.canGoBack()) {
        router.back();
        return;
      }

      router.replace(buildTicketSummaryHref(ticketOrder.order.id));
      return;
    }

    setScreen("list");
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
              {
                text: "Email",
                onPress: () => setRecipient(emails[0].email || "", "email"),
              },
              {
                text: "Mobile",
                onPress: () => setRecipient(phones[0].number || "", "mobile"),
              },
              { text: "Cancel", style: "cancel" },
            ],
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
    if (!recipientForm.firstName.trim())
      errors.firstName = "First name is required";
    if (!recipientForm.lastName.trim())
      errors.lastName = "Last name is required";

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
          setViewerIndex(0);
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
  const isViewerScreen = screen === "viewer";

  return (
    <TicketFlowContext.Provider value={ticketFlowData}>
      <View className="flex-1">
        <StatusBarChrome
          backgroundColor={isViewerScreen ? "#F9F8F4" : "transparent"}
          drawsBehindStatusBar={!isViewerScreen}
          style={isViewerScreen ? "dark" : "light"}
          useCustomAppearance
        />
        <View className=" flex-1 w-full">
          {["list", "select", "recipientChoice", "recipientForm"].includes(
            screen,
          ) ? (
            <SelectTicketsScreen
              activePanel={activePanel}
              handleListScroll={handleListScroll}
              isHeroCollapsed={isHeroCollapsed}
              onBack={handleBackToTabs}
              onOpenTicket={openTicketDetailsRoute}
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
              ticketCount={ticketFlowData.order.ticketCountLabel}
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
              onBack={handleViewerBack}
              onViewerIndexChange={setViewerIndex}
              positionLabel={activeTicketDetails.positionLabel}
              seats={transferredSeats}
              viewerIndex={viewerIndex}
            />
          ) : null}
        </View>

        <TicketTransferAuthModal
          confirmCodeReady={confirmCodeReady}
          onCancel={() => setTransferModal("none")}
          onConfirm={handleConfirmCode}
          onOtpChange={setOtpCode}
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

function buildTicketFlowDataFromOrder(
  order: TicketOrderData,
  summaryViewModel: TicketSummaryViewModel,
): TicketFlowContextValue {
  return {
    event: {
      directionsEventId: undefined,
      id: order.event.id,
      title: summaryViewModel.eventTitle,
      shortTitle: summaryViewModel.eventTitle,
      venue: summaryViewModel.eventVenue,
      venueAddress: summaryViewModel.eventVenue,
      venueSummary: `${summaryViewModel.eventTitle} at ${summaryViewModel.eventVenue}`,
      dateTime: summaryViewModel.eventFullDateTimeLabel,
      headerSubtitle: `${summaryViewModel.eventTime} - ${summaryViewModel.eventVenue}`,
      heroImage: summaryViewModel.heroImage,
      latitude: null,
      longitude: null,
      mapImageUrl: "",
    },
    order: {
      id: order.order.id,
      orderNumber: summaryViewModel.orderNumber,
      ticketCount: summaryViewModel.ticketCount,
      ticketCountLabel: summaryViewModel.ticketCountLabel,
    },
    orderId: summaryViewModel.orderId,
    seats: order.tickets.map((ticket) => ({
      id: ticket.id,
      ticketIndex: ticket.ticketIndex,
      label: ticket.type,
      note: ticket.seatingCategory,
      row: ticket.row,
      seat: ticket.seat,
      section: ticket.section,
      barcodeValue: ticket.barcodeValue,
      canTransfer: ticket.canTransfer,
      canSell: ticket.canSell,
    })),
  };
}
