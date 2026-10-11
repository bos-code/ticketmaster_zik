import { Text } from '@/components/ui/app-text';
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  useReducedMotion,
  cancelAnimation,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { EditableText } from "@/components/tickets/EditableText";
import { TicketBarcodeSvg } from "@/components/tickets/ticket-barcode-svg";
import type { Seat } from "@/components/tickets/ticketFlowTypes";
import { useTicketFlowData } from "@/components/tickets/useTicketFlowData";

export function TicketCard({
  cardWidth,
  index,
  seat,
  onLayout,
}: {
  cardWidth: number;
  index: number;
  seat: Seat;
  onLayout?: (event: LayoutChangeEvent) => void;
}) {
  const { event } = useTicketFlowData();
  const seatLabel =
    seat.label?.trim() || seat.note?.trim() || "Standard seating";
  const ticketNote =
    seat.note?.trim() || seat.label?.trim() || "Standard seating";

  return (
    <Animated.View
      onLayout={onLayout}
      entering={FadeInDown.duration(280).delay(40 + index * 70)}
      className="mr-[12px] relative overflow-hidden rounded-[12px] bg-[#242424] flex-none"
      style={{
        width: cardWidth,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 8,
      }}
    >
      <View className="h-[15px] w-full bg-[#0452FF]" />

      <View className="relative w-full" style={{ height: Math.min(320, cardWidth * 0.95) }}>
        <Image
          contentFit="cover"
          source={event.heroImage}
          style={{ height: "100%", width: "100%" }}
        />
        <View className="absolute inset-0 bg-black/10" />

        <View className="absolute top-3 left-0 right-0 px-5">
          <View className="bg-white rounded-sm py-0 shadow-lg items-center">
            <View className="flex-row items-center justify-center gap-1 py-2">
              <Text className="text-[12px] font-bold text-[#6B6B6B]">
                Ticket barcode preview
              </Text>
              <Ionicons name="refresh" size={10} color="#6B6B6B" />
            </View>
            <TicketBarcodeBand />
          </View>
        </View>

        <View className="absolute bottom-0 left-0 w-full">
          <View
            className="bg-[#242424] pt-2 pl-3 pb-2"
            style={{ width: "80%", minHeight: 56 }}
          >
            <EditableText
              field="seatLabel"
              value={seatLabel}
              className="text-[17px] mb-1 font-bold text-white leading-[23px]"
            />
            <EditableText
              field="ticketNote"
              value={ticketNote}
              className="text-[14px] text-[#AAAAAA] uppercase leading-[20px]"
            />
          </View>
        </View>
      </View>

      <View className="bg-[#242424] px-5 pt-3 pb-3">
        <View className="mt-1">
          <Text className="text-xs font-bold tracking-[1.5px] text-[#93969c] uppercase">
            SECTION
          </Text>
          <EditableText
            field="section"
            value={seat.section}
            className="text-[19px] pt-1 mb-3 font-bold leading-[26px] text-white"
          />
        </View>

        <View className="mt-1 min-h-[40px] w-full items-center justify-center bg-[#111111] px-2 py-2">
          <EditableText
            field="ticketNote"
            value={ticketNote}
            className="text-[16px] font-bold uppercase text-white tracking-[1px] text-center"
          />
        </View>

        <View className="mt-3 mb-4">
          <Text className="text-[14px] font-medium text-[#AAAAAA] uppercase">
            {`ROW ${seat.row}  •  SEAT ${seat.seat}`}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

function TicketBarcodeBand() {
  const beamProgress = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      beamProgress.value = 0.5;
      return;
    }
    beamProgress.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => cancelAnimation(beamProgress);
  }, [beamProgress, reduceMotion]);

  const beamAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(beamProgress.value, [0, 1], [-160, 160]),
        },
      ],
    };
  });

  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" className="relative h-[68px] w-full items-center justify-center overflow-hidden bg-white px-2 pb-2">
      <TicketBarcodeSvg style={{ height: 60 }} />

      <Animated.View
        className="absolute rounded-t-lg w-[6px] bg-[#026CDF]"
        style={[
          {
            height: "100%",
            top: 0,
            left: "50%",
            opacity: 1,
            shadowColor: "#026CDF",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 10,
            elevation: 5,
          },
          beamAnimatedStyle,
        ]}
      />
    </View>
  );
}
