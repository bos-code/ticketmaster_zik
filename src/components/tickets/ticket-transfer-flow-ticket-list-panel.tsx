import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { MapPreviewCard } from "@/components/tickets/ticket-transfer-flow-map-preview-card";
import { PromoCard } from "@/components/tickets/ticket-transfer-flow-promo-card";
import {
  cx,
  useTicketFlowData,
  type Seat,
} from "@/components/tickets/ticket-flow-shared";

export function TicketListPanel({
  onOpenDirections,
}: {
  onOpenDirections: () => void;
}) {
  const { order, seats } = useTicketFlowData();

  return (
    <View className="bg-white pb-4">
      <View className="border-b border-[#F1ECE8] px-5 py-6">
        <View className="flex-row items-start justify-between">
          <View className="gap-[6px]">
            <Text className="text-[17px] font-extrabold leading-[22px] text-[#141414]">
              {order.id}
            </Text>
            <Text className="text-[13px] font-medium leading-[17px] text-[#6D727A]">
              {order.ticketCount}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            className="h-9 w-9 items-center justify-center"
          >
            <Ionicons color="#1E1E1E" name="ellipsis-vertical" size={18} />
          </Pressable>
        </View>
      </View>

      <View className="gap-4 px-4 pb-1 pt-4">
        {seats.map((seat, index) => (
          <TicketSeatCard index={index} key={seat.id} seat={seat} />
        ))}
      </View>

      <MapPreviewCard onOpenDirections={onOpenDirections} />
      <PromoCard />
    </View>
  );
}

function TicketSeatCard({ index, seat }: { index: number; seat: Seat }) {
  return (
    <Animated.View
      entering={FadeInDown.duration(220).delay(40 + index * 60)}
      className="overflow-hidden rounded-[4px] bg-gray-100 py-5 text-black"
    >
      <Text className="px-4 text-[15px] font-semibold leading-[19px] text-[#111111]">
        {seat.note}
      </Text>

      <View className="my-4 h-1 w-full bg-white" />

      <View className="mt-[20px] flex-row gap-3 px-4">
        <TicketMetaCell align="left" label="SECTION" value={seat.section} />
        <TicketMetaCell align="center" label="ROW" value={seat.row} />
        <TicketMetaCell align="right" label="SEAT" value={seat.seat} />
      </View>
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
      className={cx(
        "flex-1",
        align === "center" && "items-center",
        align === "right" && "items-end",
      )}
    >
      <Text
        className={cx(
          "text-[11px] font-bold leading-[13px] text-[#999BA0]",
          align === "center" && "text-center",
          align === "right" && "text-right",
        )}
        style={{ letterSpacing: 0.8 }}
      >
        {label}
      </Text>
      <Text
        className={cx(
          "mt-[10px] text-[17px] font-bold leading-[21px] text-[#111111]",
          align === "center" && "text-center",
          align === "right" && "text-right",
        )}
      >
        {value}
      </Text>
    </View>
  );
}
