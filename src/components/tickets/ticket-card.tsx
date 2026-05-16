import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useRef } from "react";
import {
  Animated as RNAnimated,
  Easing,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { EditableText } from "@/components/tickets/EditableText";
import { TicketBarcodeSvg } from "@/components/tickets/ticket-barcode-svg";
import type { Seat } from "@/components/tickets/ticketFlowTypes";
import { useTicketFlowData } from "@/components/tickets/useTicketFlowData";

export function TicketCard({
  cardWidth,
  index,
  seat,
}: {
  cardWidth: number;
  index: number;
  seat: Seat;
}) {
  const { event } = useTicketFlowData();
  const seatLabel =
    seat.label?.trim() || seat.note?.trim() || "Standard seating";
  const ticketNote =
    seat.note?.trim() || seat.label?.trim() || "Standard seating";

  return (
    <Animated.View
      entering={FadeInDown.duration(280).delay(40 + index * 70)}
      className="mr-[12px] relative rounded-[12px] bg-white flex-none"
      style={{
        width: cardWidth,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 8,
      }}
    >
      <View className="h-[13px] w-full bg-[#0677f0]" />

      <View className="relative w-full" style={{ height: 320 }}>
        <Image
          contentFit="cover"
          source={event.heroImage}
          style={{ height: "100%", width: "100%" }}
        />
        <View className="absolute inset-0 bg-black/10" />

        <View className="absolute top-3 left-0 right-0 px-5">
          <View className="bg-white rounded-sm py-0 shadow-lg items-center">
            <View className="flex-row items-center justify-center gap-1 pt-1">
              <Text className="text-[10px] font-bold text-[#6B6B6B] tracking-tighter">
                Screenshots won&apos;t get you in
              </Text>
              <Ionicons name="refresh" size={10} color="#6B6B6B" />
            </View>
            <TicketBarcodeBand />
          </View>
        </View>

        <View className="absolute bottom-0 left-0 w-full">
          <View
            className="bg-white pt-1 pl-2 pb-1"
            style={{ width: "75%", height: 46 }}
          >
            <EditableText
              field="seatLabel"
              value={seatLabel}
              className="text-sm mb-1  tracking-wider text-[#000000] leading-tight"
            />
            <EditableText
              field="ticketNote"
              value={ticketNote}
              className="text-sm text-[#8B8F96] uppercase leading-tight"
            />
          </View>
        </View>
      </View>

      <View className="bg-white px-5 pt-2 pb-3">
        <View className="mt-1">
          <Text className="text-xs font-bold tracking-[1.5px] text-[#93969c] uppercase">
            SECTION
          </Text>
          <EditableText
            field="section"
            value={seat.section}
            className="text-base pt-1 mb-2 font-bold leading-[15px] text-[#000000]"
          />
        </View>

        <View className="mt-1 h-[32px] w-full items-center justify-center bg-[#111111]">
          <EditableText
            field="ticketNote"
            value={ticketNote}
            className="text-base font-bold uppercase text-white tracking-[2px]"
          />
        </View>

        <View className="mt-3 mb-4">
          <Text className="text-[12px] font-medium text-[#8B8F96] uppercase">
            {`ROW ${seat.row}  •  SEAT ${seat.seat}`}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

function TicketBarcodeBand() {
  const beamTranslateX = useRef(new RNAnimated.Value(-160)).current;

  useEffect(() => {
    const animation = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(beamTranslateX, {
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          toValue: 160,
          useNativeDriver: true,
        }),
        RNAnimated.timing(beamTranslateX, {
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          toValue: -160,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [beamTranslateX]);

  return (
    <View className="relative h-[58px] w-full items-center justify-center overflow-hidden bg-white px-2">
      <TicketBarcodeSvg />

      <RNAnimated.View
        style={{
          backgroundColor: "#026CDF",
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
          elevation: 5,
          height: "100%",
          left: "50%",
          opacity: 1,
          position: "absolute",
          shadowColor: "#026CDF",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 10,
          top: 0,
          transform: [{ translateX: beamTranslateX }],
          width: 6,
        }}
      />
    </View>
  );
}
