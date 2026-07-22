import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { MapPreviewCard } from "@/components/tickets/ticket-transfer-flow-map-preview-card";
import { PromoCard } from "@/components/tickets/ticket-transfer-flow-promo-card";
import { EditableText } from "@/components/tickets/EditableText";
import {
  getTicketCardBodyHeight,
  getTicketCardHeaderHeight,
  getTicketFlowHorizontalGutter,
  getTicketFlowOrderHeaderHeight,
  scaleTicketReferenceMetric,
} from "@/components/tickets/ticketFlowConstants";
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
  const { width } = useWindowDimensions();
  const horizontalGutter = getTicketFlowHorizontalGutter(width);
  const orderHeaderHeight = getTicketFlowOrderHeaderHeight(width);
  const orderFontSize = scaleTicketReferenceMetric(width, 27, 14, 16);
  const countFontSize = scaleTicketReferenceMetric(width, 18, 9, 11);

  return (
    <View style={styles.panel}>
      <View style={{ opacity: isListLoading ? 0.25 : 1, flex: 1 }}>
        <View
          style={[
            styles.orderHeader,
            { height: orderHeaderHeight, paddingHorizontal: horizontalGutter },
          ]}
        >
          <View style={styles.orderHeaderRow}>
            <View style={styles.orderTextGroup}>
              <Text style={[styles.orderId, { fontSize: orderFontSize }]}>{`Order #${order.orderNumber}`}</Text>
              <Text style={[styles.ticketCount, { fontSize: countFontSize }]}>{order.ticketCountLabel}</Text>
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

        <View style={[styles.ticketList, { paddingHorizontal: horizontalGutter }]}>
          {seats.map((seat) => (
            <TicketSeatCard
              key={seat.id}
              onPress={() => !isListLoading && onOpenTicket(Math.max(0, seat.ticketIndex - 1))}
              seat={seat}
            />
          ))}
        </View>
        <View style={[styles.moreOptionsHeader, { marginHorizontal: horizontalGutter }]}>
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
  const { width } = useWindowDimensions();
  const headerHeight = getTicketCardHeaderHeight(width);
  const bodyHeight = getTicketCardBodyHeight(width);
  const cardGap = scaleTicketReferenceMetric(width, 20, 10, 12);
  const noteFontSize = scaleTicketReferenceMetric(width, 19, 10, 11);

  return (
    <Pressable
      accessibilityLabel={`Section ${seat.section}, row ${seat.row}, seat ${seat.seat}`}
      accessibilityRole="button"
      onPress={onPress}
    >
      <View style={[styles.ticketCard, { marginBottom: cardGap }]}>
        <View style={[styles.ticketCardHeader, { height: headerHeight }]}>
          <EditableText
            field="seatLabel"
            value={seatLabel}
            style={[styles.ticketNote, { fontSize: noteFontSize }]}
          />
        </View>

        <View style={[styles.ticketMetaRow, { height: bodyHeight }]}>
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
  const { width } = useWindowDimensions();
  const labelFontSize = scaleTicketReferenceMetric(width, 16, 8, 10);
  const valueFontSize = scaleTicketReferenceMetric(width, 22, 11, 13);

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
          { fontSize: labelFontSize },
          align === "center" && styles.textCenter,
          align === "right" && styles.textRight,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.metaValue,
          { fontSize: valueFontSize },
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
    justifyContent: "center",
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
    letterSpacing: -0.45,
    lineHeight: 23,
  },
  ticketCount: {
    color: "#6E6E72",
    fontFamily: fonts.medium,
    lineHeight: 16,
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
    paddingTop: 0,
  },
  ticketCard: {
    backgroundColor: "#F4F4F4",
    borderColor: "#CDCDCD",
    borderWidth: 1,
    overflow: "hidden",
  },
  ticketCardHeader: {
    backgroundColor: "#E7E7E7",
    borderBottomColor: "#FFFFFF",
    borderBottomWidth: 3,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  ticketNote: {
    color: "#191919",
    fontFamily: fonts.bold,
    letterSpacing: -0.15,
    lineHeight: 18,
    textTransform: "uppercase",
  },
  ticketMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 14,
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
    letterSpacing: 1.35,
    lineHeight: 13,
  },
  metaValue: {
    color: "#111111",
    fontFamily: fonts.semiBold,
    lineHeight: 20,
    marginTop: 7,
  },
  moreOptionsHeader: {
    borderTopColor: "#EEEEEE",
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 17,
    paddingTop: 31,
  },
  moreOptionsText: {
    color: "#171717",
    fontFamily: fonts.extraBold,
    fontSize: 13,
    letterSpacing: 1.2,
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
