import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  absoluteFill,
  HERO_COLLAPSE_DISTANCE,
  HERO_COLLAPSED_HEIGHT,
  HERO_EXPANDED_HEIGHT,
  useTicketFlowData,
} from "@/components/tickets/ticket-flow-shared";

export function CollapsibleEventHero({
  isHeroCollapsed,
  onBack,
  onOpenViewer,
  scrollY,
}: {
  isHeroCollapsed: boolean;
  onBack: () => void;
  onOpenViewer: () => void;
  scrollY: SharedValue<number>;
}) {
  const { event, order } = useTicketFlowData();
  const heroHeightStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, HERO_COLLAPSE_DISTANCE],
      [HERO_EXPANDED_HEIGHT, HERO_COLLAPSED_HEIGHT],
      Extrapolation.CLAMP,
    ),
  }));

  const expandedContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, HERO_COLLAPSE_DISTANCE * 0.55],
      [1, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, HERO_COLLAPSE_DISTANCE],
          [0, -28],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const collapsedTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [HERO_COLLAPSE_DISTANCE * 0.28, HERO_COLLAPSE_DISTANCE * 0.8],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, HERO_COLLAPSE_DISTANCE],
          [12, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <Animated.View
      className="absolute inset-x-0 top-0 z-20 overflow-hidden bg-[#050505]"
      style={heroHeightStyle}
    >
      <Image
        contentFit="cover"
        source={{ uri: event.imageUrl }}
        style={absoluteFill}
      />
      <View className="absolute inset-0 bg-[rgba(2,2,4,0.48)]" />
      <View className="absolute inset-x-0 bottom-0 h-24 bg-[rgba(0,0,0,0.18)]" />

      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View className="px-4 pt-1">
          <View className="min-h-[42px] flex-row items-center justify-between">
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={onBack}
              className="h-10 w-10 items-center justify-center rounded-full bg-[rgba(0,0,0,0.30)]"
            >
              <Ionicons color="#FFFFFF" name="arrow-back" size={20} />
            </Pressable>

            <Animated.View
              pointerEvents="none"
              style={collapsedTitleStyle}
              className="absolute left-16 right-16 items-center"
            >
              <Text
                numberOfLines={1}
                className="text-center text-[13px] font-extrabold leading-[16px] text-white"
              >
                {event.title}
              </Text>
              <Text
                numberOfLines={1}
                className="mt-[2px] text-center text-[11px] font-normal leading-[13px] text-[rgba(255,255,255,0.84)]"
              >
                {event.venue}
              </Text>
            </Animated.View>

            {isHeroCollapsed ? (
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={onOpenViewer}
                className="h-11 w-11 items-center justify-center rounded-[14px] bg-[#0B55F5]"
              >
                <Ionicons color="#FFFFFF" name="barcode-outline" size={20} />
              </Pressable>
            ) : (
              <Text className="text-[13px] font-medium leading-4 text-white">
                Help
              </Text>
            )}
          </View>
        </View>

        <Animated.View
          style={expandedContentStyle}
          className="mt-auto px-4 pb-0"
        >
          <View className="overflow-hidden bg-[rgba(20,20,24,0.94)]">
            <View className="px-4 pt-4">
              <View className="self-start bg-[#232126] px-4 py-[10px]">
                <Text
                  className="text-[11px] font-extrabold uppercase leading-[13px] text-[rgba(255,255,255,0.92)]"
                  style={{ letterSpacing: 1 }}
                >
                  {event.dateTime}
                </Text>
              </View>

              <Text className="mt-4 text-[18px] font-extrabold leading-6 text-white">
                {event.title}
              </Text>

              <View className="mt-4 flex-row items-center justify-between pb-4">
                <Text className="text-[13px] font-normal leading-[17px] text-[rgba(255,255,255,0.76)]">
                  {event.venue}
                </Text>

                <View className="flex-row items-center gap-[5px]">
                  <Ionicons color="#E6E8EC" name="ticket-outline" size={15} />
                  <Text className="text-[17px] font-bold leading-[19px] text-[#F2F4F7]">
                    {order.ticketCount.replace(" Tickets", "")}
                  </Text>
                </View>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={onOpenViewer}
              className="min-h-[68px] flex-row items-center justify-center gap-3 bg-[#0B55F5]"
            >
              <Ionicons color="#CFE0FF" name="barcode-outline" size={18} />
              <Text className="text-[15px] font-bold leading-[18px] text-[#F5F9FF]">
                View Tickets
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}
