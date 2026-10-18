import { Text } from '@/components/ui/app-text';
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { MapPreviewCard } from "@/components/tickets/ticket-transfer-flow-map-preview-card";
import { PromoCard } from "@/components/tickets/ticket-transfer-flow-promo-card";
import { EditableText } from "@/components/tickets/EditableText";
import type { Seat } from "@/components/tickets/ticketFlowTypes";
import { useTicketFlowData } from "@/components/tickets/useTicketFlowData";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { fonts } from "../../../theme/fonts";

export function TicketListPanel({
  onOpenTicket,
  onTransfer,
}: {
  onOpenTicket: (ticketIndex: number) => void;
  onTransfer?: () => void;
}) {
  const { order, seats } = useTicketFlowData();
  const [showOptions, setShowOptions] = useState(false);
  const router = useRouter();
  const layout = useResponsiveLayout();

  return (
    <View onLayout={layout.onLayout} style={styles.panel}>
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderRow}>
          <View style={styles.orderTextGroup}>
            <Text style={styles.orderId}>{`Order #${order.orderNumber.replace(/^#/, '')}`}</Text>
            <Text style={styles.ticketCount}>{order.ticketCountLabel}</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            style={styles.menuButton}
            accessibilityLabel="Order options"
            onPress={() => setShowOptions(true)}
          >
            <Ionicons color="#FFFFFF" name="ellipsis-vertical" size={20} />
          </Pressable>
        </View>
      </View>

      <View style={[styles.ticketList, { paddingHorizontal: layout.padding }]}>
        {seats.map((seat, index) => (
          <TicketSeatCard
            width={layout.columnWidth}
            index={index}
            key={seat.id}
            onPress={() => onOpenTicket(Math.max(0, seat.ticketIndex - 1))}
            seat={seat}
          />
        ))}
      </View>
      <View style={styles.moreOptions}><Text style={styles.moreOptionsLabel}>MORE OPTIONS</Text></View>
      <MapPreviewCard />
      <Modal visible={showOptions} transparent animationType="fade" onRequestClose={() => setShowOptions(false)}>
        <View style={styles.optionsBackdrop}><Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Close order options" onPress={() => setShowOptions(false)} />
          <View style={styles.optionsMenu}><Text style={styles.optionsTitle}>{`Order ${order.orderNumber}`}</Text>
            <Pressable accessibilityRole="button" style={styles.optionRow} onPress={() => { setShowOptions(false); onOpenTicket(0); }}><Text style={styles.optionLabel}>View Tickets</Text></Pressable>
            {onTransfer && <Pressable accessibilityRole="button" style={styles.optionRow} onPress={() => { setShowOptions(false); onTransfer(); }}><Text style={styles.optionLabel}>Transfer Tickets</Text></Pressable>}
            <Pressable accessibilityRole="button" style={styles.optionRow} onPress={() => { setShowOptions(false); router.push('/account/help'); }}><Text style={styles.optionLabel}>Get Help</Text></Pressable>
            <Pressable accessibilityRole="button" style={styles.optionRow} onPress={() => setShowOptions(false)}><Text style={styles.optionLabel}>Cancel</Text></Pressable>
          </View>
        </View>
      </Modal>
      <PromoCard />
    </View>
  );
}

function TicketSeatCard({
  index,
  onPress,
  seat,
  width,
}: {
  index: number;
  onPress: () => void;
  seat: Seat;
  width: number;
}) {
  const seatLabel = seat.label?.trim() || seat.note?.trim() || "Standard";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{ width }}
    >
      <Animated.View
        entering={FadeInDown.duration(220).delay(40 + index * 60)}
        style={styles.ticketCard}
      >
        <View style={styles.ticketCardHeader}>
          <EditableText field="seatLabel" value={seatLabel} style={styles.ticketNote} />
        </View>

        <View style={styles.ticketMetaRow}>
          <TicketMetaCell align="left" label="SECTION" value={seat.section} />
          <TicketMetaCell align="center" label="ROW" value={seat.row} />
          <TicketMetaCell align="right" label="SEAT" value={seat.seat} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

function TicketMetaCell({
  align = "left",
  label,
  value,
}: {
  align?: "left" | "center" | "right";
  label: string;
  value: string;
}) {
  return (
    <View
      style={[
        styles.metaCell,
        align === "center" && styles.metaCellCenter,
        align === "right" && styles.metaCellRight,
      ]}
    >
      <Text
        style={[
          styles.metaLabel,
          align === "center" && styles.textCenter,
          align === "right" && styles.textRight,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.metaValue,
          align === "center" && styles.textCenter,
          align === "right" && styles.textRight,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  moreOptions: { marginHorizontal: 15, paddingTop: 28, marginTop: 17 },
  moreOptionsLabel: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.8 },
  optionsBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  optionsMenu: { width: '100%', maxWidth: 560, alignSelf: 'center', padding: 22, paddingBottom: 35, backgroundColor: "#242424" },
  optionsTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "700", marginBottom: 8 },
  optionRow: { minHeight: 48, justifyContent: "center" },
  optionLabel: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  panel: {
    backgroundColor: "#111111",
  },
  orderHeader: {
    paddingHorizontal: 15,
    paddingBottom: 18,
    paddingTop: 20,
  },
  orderHeaderRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderTextGroup: {
    flex: 1,
    minWidth: 0,
    gap: 4,
    paddingTop: 2,
  },
  orderId: {
    color: "#FFFFFF",
    fontFamily: fonts.extraBold,
    fontSize: 20,
    letterSpacing: 0,
    lineHeight: 23,
  },
  ticketCount: {
    color: "#AAAAAA",
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 22,
  },
  menuButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    marginRight: -6,
    marginTop: -2,
    width: 44,
  },
  ticketList: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 24,
    rowGap: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  ticketCard: {
    backgroundColor: "#242424",

    borderRadius: 0,
    borderWidth: 0,
    borderColor: "#242424",

    overflow: "hidden",
  },
  ticketCardHeader: {
    borderBottomColor: "#1B1B1B",
    borderBottomWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 13,
    backgroundColor: "#242424",
  },
  ticketNote: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 21,
  },
  ticketMetaRow: {
    flexDirection: "row",
    paddingBottom: 16,
    paddingHorizontal: 15,
    paddingTop: 14,
  },
  metaCell: {
    flex: 1,
  },
  metaCellCenter: {
    alignItems: "center",
  },
  metaCellRight: {
    alignItems: "flex-end",
  },
  metaLabel: {
    color: "#AAAAAA",
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 1,
    lineHeight: 18,
  },
  metaValue: {
    color: "#FFFFFF",
    fontFamily: fonts.extraBold,
    fontSize: 18,
    lineHeight: 25,
    marginTop: 6,
  },
  textCenter: {
    textAlign: "center",
  },
  textRight: {
    textAlign: "right",
  },
});
