import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { MapPreviewCard } from "@/components/tickets/ticket-transfer-flow-map-preview-card";
import { PromoCard } from "@/components/tickets/ticket-transfer-flow-promo-card";
import { EditableText } from "@/components/tickets/EditableText";
import type { Seat } from "@/components/tickets/ticketFlowTypes";
import { useTicketFlowData } from "@/components/tickets/useTicketFlowData";
import { fonts } from "../../../theme/fonts";
import { TicketMenuIcon } from "@/components/tickets/ticket-transfer-flow-icons";

export function TicketListPanel({
  isListLoading,
  onOpenTicket,
}: {
  isListLoading?: boolean;
  onOpenTicket: (ticketIndex: number) => void;
}) {
  const { order, seats } = useTicketFlowData();

  return (
    <View style={styles.panel}>
      <View style={{ opacity: isListLoading ? 0.25 : 1, flex: 1 }}>
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderRow}>
            <View style={styles.orderTextGroup}>
              <Text style={styles.orderId}>{`Order #${order.orderNumber}`}</Text>
              <Text style={styles.ticketCount}>{order.ticketCountLabel}</Text>
            </View>

            <Pressable
              accessibilityLabel="More ticket options"
              accessibilityRole="button"
              hitSlop={8}
              style={styles.menuButton}
            >
              <TicketMenuIcon color="#171717" size={20} />
            </Pressable>
          </View>
        </View>

        <View style={styles.ticketList}>
          {seats.map((seat) => (
            <TicketSeatCard
              key={seat.id}
              onPress={() => !isListLoading && onOpenTicket(Math.max(0, seat.ticketIndex - 1))}
              seat={seat}
            />
          ))}
        </View>
        <View style={styles.moreOptionsHeader}>
          <Text style={styles.moreOptionsText}>MORE OPTIONS</Text>
        </View>
        <MapPreviewCard />
        <PromoCard />
      </View>
      {isListLoading && (
        <View style={styles.spinnerOverlay}>
          <ActivityIndicator color="#5C94DA" size="large" />
        </View>
      )}
    </View>
  );
}

function TicketSeatCard({
  onPress,
  seat,
}: {
  onPress: () => void;
  seat: Seat;
}) {
  const seatLabel = seat.label?.trim() || seat.note?.trim() || "Standard";

  return (
    <Pressable
      accessibilityLabel={`Section ${seat.section}, row ${seat.row}, seat ${seat.seat}`}
      accessibilityRole="button"
      onPress={onPress}
    >
      <View style={styles.ticketCard}>
        <View style={styles.ticketCardHeader}>
          <EditableText field="seatLabel" value={seatLabel} style={styles.ticketNote} />
        </View>

        <View style={styles.ticketMetaRow}>
          <TicketMetaCell align="left" label="SECTION" value={seat.section} />
          <TicketMetaCell align="center" label="ROW" value={seat.row} />
          <TicketMetaCell align="right" label="SEAT" value={seat.seat} />
        </View>
      </View>
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
  panel: {
    backgroundColor: "#FFFFFF",
  },
  orderHeader: {
    paddingHorizontal: 14,
    paddingBottom: 11,
    paddingTop: 18,
  },
  orderHeaderRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderTextGroup: {
    gap: 2,
    paddingTop: 2,
  },
  orderId: {
    color: "#171717",
    fontFamily: fonts.extraBold,
    fontSize: 19,
    letterSpacing: -0.55,
    lineHeight: 25,
  },
  ticketCount: {
    color: "#6E6E72",
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 17,
  },
  menuButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    marginRight: -10,
    marginTop: -6,
    width: 44,
  },
  ticketList: {
    paddingBottom: -2,
    paddingHorizontal: 14,
    paddingTop: 6,
  },
  ticketCard: {
    backgroundColor: "#F4F4F4",
    borderColor: "#CDCDCD",
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  ticketCardHeader: {
    backgroundColor: "#E7E7E7",
    borderBottomColor: "#FFFFFF",
    borderBottomWidth: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  ticketNote: {
    color: "#191919",
    fontFamily: fonts.bold,
    fontSize: 14,
    letterSpacing: -0.2,
    lineHeight: 21,
    textTransform: "uppercase",
  },
  ticketMetaRow: {
    flexDirection: "row",
    paddingBottom: 15,
    paddingHorizontal: 14,
    paddingTop: 15,
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
    color: "#747478",
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.35,
    lineHeight: 13,
  },
  metaValue: {
    color: "#111111",
    fontFamily: fonts.extraBold,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 9,
  },
  moreOptionsHeader: {
    borderTopColor: "#EEEEEE",
    borderTopWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 14,
    marginTop: 24,
    paddingTop: 31,
  },
  moreOptionsText: {
    color: "#171717",
    fontFamily: fonts.extraBold,
    fontSize: 14,
    letterSpacing: 1.3,
    lineHeight: 18,
  },
  textCenter: {
    textAlign: "center",
  },
  textRight: {
    textAlign: "right",
  },
  spinnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
  },
});
