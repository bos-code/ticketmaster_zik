import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
    Easing,
    FadeInDown,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

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

  return (
    <Animated.View
      entering={FadeInDown.duration(280).delay(40 + index * 70)}
      className="mr-[12px] relative overflow-hidden rounded-[8px] bg-white flex-none self-start"
      style={{
        width: cardWidth,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
      }}
    >
      {/* 3A. Top Decorative Bar */}
      <View className="h-[10px] w-full bg-[#026CDF]" />

      {/* Hero Container (Image + Barcode + Step Panel) */}
      <View className="relative w-full" style={{ height: 320 }}>
        {/* Grayscale Image - Stretches from the blue stripe */}
        <Image
          contentFit="cover"
          source={{ uri: event.imageUrl }}
          style={{ height: "100%", width: "100%" }}
        />
        <View className="absolute inset-0 bg-black/10" />

        {/* 3B. Barcode Section - Overlaid on top of the image */}
        <View className="absolute top-3 left-0 right-0 px-5">
            <View className="bg-white rounded-sm py-0 shadow-lg items-center">
                <View className="flex-row items-center justify-center gap-1 pt-1">
                    <Text className="text-[10px] font-bold text-[#6B6B6B] tracking-tighter">
                        Screenshots won't get you in
                    </Text>
                    <Ionicons name="refresh" size={10} color="#6B6B6B" />
                </View>
                <TicketBarcodeBand seat={seat} />
            </View>
        </View>

        {/* 3C. The "Step" Layout - Overlaid at the bottom of the image */}
        <View className="absolute bottom-0 left-0 w-full">
          {/* Left taller panel (75% width) */}
          <View className="bg-white pt-1 px-4 pb-1" style={{ width: "75%", height: 46 }}>
            <Text className="text-[14px] font-bold text-[#000000] leading-tight">
              Arist presale
            </Text>
            <Text className="text-[10px] font-semibold text-[#8B8F96] uppercase tracking-tighter leading-tight">
              LOWER BOWL SEATING
            </Text>
          </View>
        </View>
      </View>

      {/* Content below the step image area */}
      <View className="bg-white px-5 pt-0 pb-3">
        <View className="mt-1">
          <Text className="text-[10px] font-bold tracking-[1.5px] text-[#A7ACB5] uppercase">
            SECTION
          </Text>
          <Text className="text-[18px] font-extrabold leading-[22px] text-[#000000]">
            {seat.section}
          </Text>
        </View>

        {/* 3D. Seating Block */}
        <View className="mt-1 h-[32px] w-full items-center justify-center bg-[#111111]">
          <Text className="text-[11px] font-bold uppercase text-white tracking-widest">
            LOWER BOWL SEATING
          </Text>
        </View>

        {/* 3E. Footer Section */}
        <View className="mt-2">
          <Text className="text-[12px] font-medium text-[#8B8F96] uppercase">
            {`ROW ${seat.row}  ·  SEAT ${seat.seat}`}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

function TicketBarcodeBand({ seat }: { seat: Seat }) {
  const { event } = useTicketFlowData();
  const qrValue = `${event.shortTitle}-${seat.section}-${seat.row}-${seat.seat}`;
  const beamProgress = useSharedValue(0);

  useEffect(() => {
    beamProgress.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [beamProgress]);

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
    <View className="relative h-[58px] w-full items-center justify-center overflow-hidden bg-white px-2">
      <Image
        contentFit="contain"
        source={require("../../../assets/image.png")}
        style={{ height: 90, width: "100%" }}
      />

      <Animated.View
        className="absolute w-[4px] bg-[#026CDF]"
        style={[
          {
            height: 52,
            top: 3,
            left: "50%",
            opacity: 0.8,
            shadowColor: "#026CDF",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.9,
            shadowRadius: 8,
            elevation: 4,
          },
          beamAnimatedStyle,
        ]}
      />
    </View>
  );
}
