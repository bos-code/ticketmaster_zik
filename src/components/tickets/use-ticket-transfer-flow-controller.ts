import * as Contacts from "expo-contacts";
import { type Href, router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, useWindowDimensions } from "react-native";
import {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

import { buildSeatSummary } from "@/components/tickets/buildSeatSummary";
import { buildTicketFlowDataFromOrder } from "@/components/tickets/ticket-transfer-flow-data";
import {
  emptyRecipientForm,
  validateRecipientForm,
} from "@/components/tickets/ticket-transfer-flow-form";
import {
  EMPTY_SEATS,
  HERO_COLLAPSE_DISTANCE,
} from "@/components/tickets/ticketFlowConstants";
import type {
  DeliveryMode,
  FlowScreen,
  PanelTab,
  RecipientFormState,
  TransferModal,
} from "@/components/tickets/ticketFlowTypes";
import { useTicketOrder } from "@/hooks/useTicketOrder";

const CAROUSEL_CARD_WIDTH_RATIO = 0.78;
const CAROUSEL_GAP = 24;

export function useTicketTransferFlowController({
  initialScreen,
  initialTicketIndex,
  orderId,
}: {
  initialScreen: "list" | "viewer";
  initialTicketIndex: number;
  orderId?: string;
}) {
  const {
    getDetailsViewModel,
    isLoadingTickets,
    summaryViewModel,
    ticketOrder,
  } =
    useTicketOrder(orderId);
  const { width } = useWindowDimensions();
  const frameWidth = Math.min(width, 430);
  const carouselCardWidth = Math.round(frameWidth * CAROUSEL_CARD_WIDTH_RATIO);
  const carouselSnapInterval = carouselCardWidth + CAROUSEL_GAP;
  const initialViewerIndex = useMemo(
    () => getDetailsViewModel(initialTicketIndex).activeIndex,
    [getDetailsViewModel, initialTicketIndex],
  );
  const ticketFlowData = useMemo(
    () =>
      ticketOrder && summaryViewModel
        ? buildTicketFlowDataFromOrder(ticketOrder, summaryViewModel)
        : null,
    [summaryViewModel, ticketOrder],
  );
  const currentOrderId = ticketOrder?.order.id;

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
  const [recipientForm, setRecipientForm] =
    useState<RecipientFormState>(emptyRecipientForm);
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
  const isViewerScreen = screen === "viewer";

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

  const updateRecipientForm = (
    field: keyof RecipientFormState,
    value: string,
  ) => {
    setRecipientForm((current) => {
      const next = {
        ...current,
        [field]: value,
      };

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
      if (!currentOrderId) {
        return;
      }

      const nextDetails = getDetailsViewModel(ticketIndex);

      router.push({
        pathname: "/tickets/[orderId]",
        params: {
          orderId: currentOrderId,
          ticketIndex: String(nextDetails.activeIndex),
        },
      });
    },
    [currentOrderId, getDetailsViewModel],
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

      if (currentOrderId) {
        router.replace(buildTicketSummaryHref(currentOrderId));
        return;
      }

      router.replace("/my-tickets");
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
      if (!contact) {
        return;
      }

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
        setFormErrors({});
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
    } catch (error) {
      console.error(error);
      alert("An error occurred while picking a contact");
    }
  };

  const handleToggleDeliveryMode = () => {
    setDeliveryMode((current) => (current === "email" ? "mobile" : "email"));
    updateRecipientForm("destination", "");
  };

  const handleRequestTransfer = () => {
    const errors = validateRecipientForm(recipientForm);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setOtpCode("");
    setFormErrors({});
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

    loadingTimerRef.current = setTimeout(() => {
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        setTransferModal("success");
        setTimeout(() => {
          setViewerIndex(0);
          setScreen("viewer");
          setTransferModal("none");
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

  return {
    activePanel,
    activeTicketDetails,
    carouselCardWidth,
    carouselSnapInterval,
    confirmCodeReady,
    deliveryMode,
    formErrors,
    frameWidth,
    handleBackToTabs,
    handleConfirmCode,
    handleListScroll,
    handleOpenRecipientForm,
    handleOpenViewer,
    handlePickContact,
    handleRequestTransfer,
    handleRetryTransfer,
    handleToggleDeliveryMode,
    handleTransferStart,
    handleViewerBack,
    isHeroCollapsed,
    isLoadingTickets,
    isViewerScreen,
    openTicketDetailsRoute,
    otpCode,
    recipientForm,
    screen,
    scrollY,
    seatSummary,
    seats,
    selectedSeatIds,
    setActivePanel,
    setOtpCode,
    setScreen,
    setTransferModal,
    setViewerIndex,
    ticketFlowData,
    ticketOrder,
    toggleSeat,
    transferModal,
    transferReady,
    transferredSeats,
    updateRecipientForm,
    viewerIndex,
  };
}
