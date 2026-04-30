import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { useTicketFlowData } from "@/components/tickets/useTicketFlowData";

export function MapPreviewCard({
  onOpenDirections,
}: {
  onOpenDirections: () => void;
}) {
  const { event } = useTicketFlowData();

  return (
    <Animated.View
      entering={FadeInUp.duration(240)}
      className="mx-4 mt-5 overflow-hidden bg-[#F4F1EE]"
    >
      <View className="relative">
        <Image
          contentFit="cover"
          source={{ uri: event.mapImageUrl }}
          style={{ height: 252, width: "100%" }}
        />

        <View className="absolute inset-0 items-center justify-center">
          <Ionicons color="#F3182E" name="location" size={42} />
          <View className="mt-1 rounded-full bg-[rgba(255,255,255,0.93)] px-3 py-[6px]">
            <Text className="text-[12px] font-semibold leading-[15px] text-[#1A1A1A]">
              {event.venue}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        className="min-h-[62px] items-center justify-center bg-[#F4F1EE]"
        onPress={onOpenDirections}
      >
        <Text className="text-[18px] font-bold leading-[22px] text-[#141414]">
          Get Directions
        </Text>
      </Pressable>
    </Animated.View>
  );
}
