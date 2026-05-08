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
  HERO_IMAGE_HEIGHT,
} from "@/components/tickets/ticketFlowConstants";
import { useTicketFlowData } from "@/components/tickets/useTicketFlowData";

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
      className="absolute  inset-x-0 top-0 z-20 overflow-hidden"
      style={heroHeightStyle}
    >
      <Image
        contentFit="cover"
        source={event.heroImage}
        style={{ height: HERO_IMAGE_HEIGHT, width: "100%" }}
      />
      <View
        className="absolute inset-x-0 top-0 bg-[rgba(2,2,4,0.48)]"
        style={{ height: HERO_IMAGE_HEIGHT }}
      />
      <View
        className="absolute inset-x-0 h-24 bg-[rgba(0,0,0,0.18)]"
        style={{ top: HERO_IMAGE_HEIGHT - 96 }}
      />

      <SafeAreaView edges={["top"]} style={absoluteFill}>
        <View className="px-4 pt-1">
          <View className=" mt-4 flex-row items-center justify-between">
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={onBack}
              className="h-10 w-10 items-center justify-center rounded-full bg-[rgba(0,0,0,0.40)]"
            >
              <Ionicons color="#FFFFFF" name="arrow-back" size={24} />
            </Pressable>

            <Animated.View
              style={[collapsedTitleStyle, { pointerEvents: 'none' }]}
              className="absolute left-16 right-16 items-start"
            >
              <Text
                numberOfLines={1}
                className=" text-[13px] font-extrabold  text-white"
              >
                {event.title}
              </Text>
              <Text
                numberOfLines={1}
                className=" text-center text-[11px] font-normal leading-[13px] text-[rgba(255,255,255,0.84)]"
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
          className="absolute inset-x-0  px-4"
          style={[expandedContentStyle, { top: HERO_IMAGE_HEIGHT, pointerEvents: isHeroCollapsed ? 'none' : 'auto' }]}
        >
          <View className="relative -top-8 pt-4">
            <View className="absolute left-0 -top-4 z-10 self-start">
              <View className="justify-center bg-[#232126] px-4 py-2">
                <Text className="text-sm font-extrabold uppercase leading-[13px] tracking-[1px] text-[rgba(255,255,255,0.92)]">
                  {event.dateTime}
                </Text>
              </View>
              <View className="absolute inset-x-0 -bottom-4 h-4 bg-[#232126]" />
            </View>
            <View className="bg-[#232126] px-4 pt-4">
              <Text className="pt-1 text-2xl font-bold leading-6 text-white">
                {event.title}
              </Text>

              <View className="mt-3 flex-row items-center justify-between pb-2">
                <Text className="text-[13px] font-normal leading-[17px] text-[rgba(255,255,255,0.76)]">
                  {event.venue}
                </Text>

                <View className="flex-row items-center gap-[5px]">
                  <Image
                    contentFit="contain"
                    source={require("../../../assets/ticketx3.png")}
                    style={{ height: 15, width: 15 }}
                  />
                  <Text className="text-[17px]  font-bold leading-[19px] text-[#F2F4F7]">
                    {`x${order.ticketCount}`}
                  </Text>
                </View>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={onOpenViewer}
              className="min-h-[42px] flex-row items-center justify-center gap-[6px] bg-[#0444f3]"
            >
              <Ionicons color="#CFE0FF" name="barcode-outline" size={14} />
              <Text className="text-[13px] font-bold leading-[16px] text-[#F5F9FF]">
                View Tickets
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}
