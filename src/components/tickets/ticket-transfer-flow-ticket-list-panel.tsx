import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { MapPreviewCard } from "@/components/tickets/ticket-transfer-flow-map-preview-card";
import { PromoCard } from "@/components/tickets/ticket-transfer-flow-promo-card";
import { EditableText } from "@/components/tickets/EditableText";
import type { Seat } from "@/components/tickets/ticketFlowTypes";
import { useTicketFlowData } from "@/components/tickets/useTicketFlowData";
import { fonts } from "../../../theme/fonts";

export function TicketListPanel({
  onOpenTicket,
}: {
  onOpenTicket: (ticketIndex: number) => void;
}) {
  const { order, seats } = useTicketFlowData();

  return (
    <View style={styles.panel}>
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderRow}>
          <View style={styles.orderTextGroup}>
            <Text style={styles.orderId}>{order.orderNumber}</Text>
            <Text style={styles.ticketCount}>{order.ticketCountLabel}</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            style={styles.menuButton}
          >
            <Ionicons color="#242424" name="ellipsis-vertical" size={20} />
          </Pressable>
        </View>
      </View>

      <View style={styles.ticketList}>
        {seats.map((seat, index) => (
          <TicketSeatCard
            index={index}
            key={seat.id}
            onOpenTicket={onOpenTicket}
            seat={seat}
          />
        ))}
      </View>
      <MapPreviewCard />
      <PromoCard />
    </View>
  );
}

function TicketSeatCard({
  index,
  onOpenTicket,
  seat,
}: {
  index: number;
  onOpenTicket: (ticketIndex: number) => void;
  seat: Seat;
}) {
  const seatLabel = seat.label?.trim() || seat.note?.trim() || "Standard";

  return (
    <Animated.View
      entering={FadeInDown.duration(220).delay(40 + index * 60)}
      style={styles.ticketCard}
    >
      <Pressable accessibilityRole="button" onPress={() => onOpenTicket(index)}>
        <View style={styles.ticketCardHeader}>
          <EditableText field="seatLabel" value={seatLabel} style={styles.ticketNote} />
        </View>

        <View style={styles.ticketMetaRow}>
          <TicketMetaCell align="left" label="SECTION" value={seat.section} />
          <TicketMetaCell align="center" label="ROW" value={seat.row} />
          <TicketMetaCell align="right" label="SEAT" value={seat.seat} />
        </View>
      </Pressable>
    </Animated.View>
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
  panel: {
    backgroundColor: "#FFFFFF",
  },
  orderHeader: {
    paddingHorizontal: 22,
    paddingBottom: 10,
    paddingTop: 20,
  },
  orderHeaderRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderTextGroup: {
    gap: 4,
    paddingTop: 2,
  },
  orderId: {
    color: "#171717",
    fontFamily: fonts.extraBold,
    fontSize: 14,
    letterSpacing: -0.4,
    lineHeight: 23,
  },
  ticketCount: {
    color: "#6E6E72",
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 20,
  },
  menuButton: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    marginRight: -6,
    marginTop: -2,
    width: 32,
  },
  ticketList: {
    paddingBottom: -2,
    paddingHorizontal: 22,
    paddingTop: 6,
  },
  ticketCard: {
    backgroundColor: "#f0eeef",
    marginBottom: 14,
    borderRadius: 5,

    overflow: "hidden",
  },
  ticketCardHeader: {
    borderBottomColor: "#FFFDFD",
    borderBottomWidth: 3,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  ticketNote: {
    color: "#191919",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    letterSpacing: -0.2,
    lineHeight: 21,
  },
  ticketMetaRow: {
    flexDirection: "row",
    paddingBottom: 15,
    paddingHorizontal: 18,
    paddingTop: 16,
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
    color: "#8D8D93",
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.35,
    lineHeight: 13,
  },
  metaValue: {
    color: "#111111",
    fontFamily: fonts.extraBold,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 9,
  },
  textCenter: {
    textAlign: "center",
  },
  textRight: {
    textAlign: "right",
  },
});
