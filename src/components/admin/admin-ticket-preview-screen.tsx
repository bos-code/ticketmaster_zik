import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useImmersiveSafeAreaInsets } from "@/components/immersive/edge-to-edge-hero";

import {
  EditableProvider,
  type EditableContextValue,
} from "@/components/tickets/EditableContext";
import { TicketFlowContext } from "@/components/tickets/TicketFlowContext";
import { TicketTransferListScreen } from "@/components/tickets/ticket-transfer-flow-list-screen";
import type {
  PanelTab,
  Seat,
  TicketFlowContextValue,
} from "@/components/tickets/ticketFlowTypes";
import {
  getSimpleTicketSeatNumbers,
  useTicketStore,
  type TicketInput,
  type TicketRecord,
} from "@/store/ticketStore";

export function AdminTicketPreviewScreen() {
  const router = useRouter();
  const insets = useImmersiveSafeAreaInsets();
  const params = useLocalSearchParams<{ ticketId?: string }>();
  const ticketId =
    typeof params.ticketId === "string" ? params.ticketId : undefined;

  const originalTicket = useTicketStore((state) =>
    ticketId ? state.tickets.find((t) => t.id === ticketId) : undefined,
  );
  const updateEvent = useTicketStore((state) => state.updateEvent);

  const [editedTicket, setEditedTicket] = useState<TicketRecord | null>(
    originalTicket ? { ...originalTicket } : null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // List screen state
  const [activePanel, setActivePanel] = useState<PanelTab>("tickets");
  const scrollY = useSharedValue(0);

  const handleListScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const isDirty = useMemo(() => {
    if (!originalTicket || !editedTicket) return false;

    const keys = Object.keys(originalTicket) as (keyof TicketRecord)[];
    return keys.some((key) => originalTicket[key] !== editedTicket[key]);
  }, [originalTicket, editedTicket]);

  const handleFieldChange = useCallback(
    (field: keyof TicketRecord, value: string) => {
      setEditedTicket((prev) => (prev ? { ...prev, [field]: value } : prev));
    },
    [],
  );

  const editableCtx = useMemo<EditableContextValue | null>(
    () =>
      editedTicket
        ? {
            editable: true,
            ticket: editedTicket,
            onFieldChange: handleFieldChange,
          }
        : null,
    [editedTicket, handleFieldChange],
  );

  const flowData = useMemo<TicketFlowContextValue | null>(() => {
    if (!editedTicket) return null;

    const normalizedSeats = getSimpleTicketSeatNumbers(editedTicket.seatRange);
    const seats: Seat[] = normalizedSeats.map((seat, index) => ({
      id: `${editedTicket.id}-seat-${index + 1}`,
      ticketIndex: index + 1,
      label: editedTicket.seatLabel || editedTicket.ticketType,
      note: editedTicket.ticketNote || "Standard seating",
      row: editedTicket.row,
      seat,
      section: editedTicket.section,
      barcodeValue: editedTicket.barcode,
      canTransfer: true,
      canSell: false,
    }));

    return {
      event: {
        dateTime: `${editedTicket.date} • ${editedTicket.time}`,
        directionsEventId: undefined,
        headerSubtitle: `${editedTicket.time} - ${editedTicket.venue}`,
        heroImage: { uri: editedTicket.image },
        id: editedTicket.id,
        latitude: null,
        longitude: null,
        mapImageUrl: "",
        shortTitle: editedTicket.eventName,
        title: editedTicket.eventName,
        venue: editedTicket.venue,
        venueAddress: `${editedTicket.city}, ${editedTicket.state}`,
        venueSummary: editedTicket.venue,
      },
      order: {
        id: editedTicket.id,
        orderNumber: editedTicket.orderNumber,
        ticketCount: seats.length,
        ticketCountLabel: `x${seats.length} Ticket${seats.length > 1 ? "s" : ""}`,
      },
      orderId: editedTicket.id,
      seats,
    };
  }, [editedTicket]);

  function goBackFromPreview() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/admin");
  }

  async function handleSave() {
    if (!editedTicket || !ticketId || !isDirty) return;

    setIsSaving(true);

    try {
      const payload: TicketInput = {
        eventName: editedTicket.eventName,
        artistName: editedTicket.artistName,
        albumName: editedTicket.albumName,
        venue: editedTicket.venue,
        city: editedTicket.city,
        state: editedTicket.state,
        country: editedTicket.country,
        date: editedTicket.date,
        time: editedTicket.time,
        purchaseDate: editedTicket.purchaseDate,
        section: editedTicket.section,
        row: editedTicket.row,
        seatRange: editedTicket.seatRange,
        barcode: editedTicket.barcode,
        orderNumber: editedTicket.orderNumber,
        ticketType: editedTicket.ticketType,
        status: editedTicket.status,
        perks: editedTicket.perks,
        transferRules: editedTicket.transferRules,
        image: editedTicket.image,
        backgroundColor: editedTicket.backgroundColor,
        seatLabel: editedTicket.seatLabel,
        ticketNote: editedTicket.ticketNote,
      };

      await updateEvent(ticketId, payload);
      showToast("Changes saved");
      setTimeout(() => goBackFromPreview(), 600);
    } catch {
      Alert.alert(
        "Save failed",
        "Could not save ticket changes. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    if (isDirty) {
      Alert.alert("Discard changes?", "Your edits will be lost.", [
        { text: "Keep editing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: goBackFromPreview },
      ]);
      return;
    }

    goBackFromPreview();
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 1800);
  }

  // Not found state
  if (!originalTicket || !editedTicket || !flowData || !editableCtx) {
    return (
      <View style={styles.root}>
        <View style={styles.centered}>
          <Ionicons color="#B79E6A" name="ticket-outline" size={34} />
          <Text style={styles.notFoundTitle}>Ticket not found</Text>
          <Text style={styles.notFoundBody}>
            This ticket may have been deleted.
          </Text>
          <Pressable onPress={goBackFromPreview} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Pressable
        onPress={handleCancel}
        style={[styles.backButtonFloating, { top: insets.top + 6 }]}
      >
        <Ionicons color="#FFFFFF" name="chevron-back" size={20} />
      </Pressable>

      {/* Admin badge */}
      <View style={[styles.adminBadge, { top: insets.top + 6 }]}>
        <View style={styles.adminBadgeDot} />
        <Text style={styles.adminBadgeText}>LIVE PREVIEW</Text>
      </View>

      {/* Real ticket UI */}
      <EditableProvider value={editableCtx}>
        <TicketFlowContext.Provider value={flowData}>
          <TicketTransferListScreen
            activePanel={activePanel}
            handleListScroll={handleListScroll}
            isHeroCollapsed={false}
            onBack={handleCancel}
            onOpenTicket={() => {}}
            onOpenViewer={() => {}}
            onPanelChange={setActivePanel}
            onTransfer={() => {}}
            scrollY={scrollY}
          />
        </TicketFlowContext.Provider>
      </EditableProvider>

      {/* Floating admin toolbar */}
      <Animated.View
        entering={FadeIn.delay(200).duration(280)}
        style={[
          styles.toolbar,
          { paddingBottom: Math.max(insets.bottom, 12) + 4 },
        ]}
      >
        <Pressable onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>

        <Pressable
          disabled={!isDirty || isSaving}
          onPress={() => {
            void handleSave();
          }}
          style={[
            styles.saveButton,
            (!isDirty || isSaving) && styles.saveButtonDisabled,
          ]}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons color="#FFFFFF" name="save-outline" size={16} />
              <Text style={styles.saveButtonText}>Save</Text>
            </>
          )}
        </Pressable>
      </Animated.View>

      {/* Toast */}
      {toast ? (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[styles.toast, { bottom: Math.max(insets.bottom, 12) + 80 }]}
        >
          <Ionicons color="#FFFFFF" name="checkmark-circle" size={16} />
          <Text style={styles.toastText}>{toast}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#FFFFFF",
    flex: 1,
  },
  centered: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 24,
  },
  notFoundTitle: {
    color: "#111111",
    fontSize: 20,
    fontWeight: "900",
  },
  notFoundBody: {
    color: "#70757E",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "#005BD3",
    borderRadius: 8,
    marginTop: 8,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  adminBadge: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(11, 85, 245, 0.88)",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    position: "absolute",
    zIndex: 100,
  },
  adminBadgeDot: {
    backgroundColor: "#7CFC00",
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  adminBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.8,
  },
  backButtonFloating: {
    alignItems: "center",
    backgroundColor: "rgba(17, 24, 39, 0.84)",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    left: 16,
    position: "absolute",
    width: 40,
    zIndex: 101,
  },
  toolbar: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderTopColor: "#E5E7EB",
    borderTopWidth: StyleSheet.hairlineWidth,
    bottom: 0,
    flexDirection: "row",
    gap: 10,
    left: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    position: "absolute",
    right: 0,
  },
  cancelButton: {
    alignItems: "center",
    borderColor: "#E5E7EB",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: "#005BD3",
    borderRadius: 8,
    flex: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 48,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  toast: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#111827",
    borderRadius: 999,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: "absolute",
  },
  toastText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
