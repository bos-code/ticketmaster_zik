import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  FlatList,
  Pressable,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  softPillShadow,
  useTicketFlowData,
  type Seat,
} from "@/components/tickets/ticket-flow-shared";
import {
  TicketCard,
} from "@/components/tickets/ticket-transfer-flow-transfer-ui";

function ViewerHeader({ onBack }: { onBack: () => void }) {
  const { event } = useTicketFlowData();

  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: "#FFFFFF" }}>
      <View className="flex-row items-center bg-white px-[10px] py-[6px]">
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBack}
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons color="#000000" name="chevron-back" size={26} />
        </Pressable>

        <View className="ml-1 justify-center">
          <Text className="text-[16px] font-extrabold leading-[20px] text-[#000000]">
            {event.title}
          </Text>
          <Text className="mt-[2px] text-[12px] font-medium leading-[14px] text-[#6B6B6B]">
            {event.dateTime} - {event.venue}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export function TicketTransferViewerScreen({
  carouselCardWidth,
  carouselSnapInterval,
  onBack,
  onViewerIndexChange,
  seats,
  viewerIndex,
}: {
  carouselCardWidth: number;
  carouselSnapInterval: number;
  onBack: () => void;
  onViewerIndexChange: (index: number) => void;
  seats: Seat[];
  viewerIndex: number;
}) {
  const viewerListRef = useRef<FlatList<Seat>>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      viewerListRef.current?.scrollToOffset({
        animated: false,
        offset: viewerIndex * carouselSnapInterval,
      });
    });
  }, [carouselSnapInterval, viewerIndex]);

  const handleViewerScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / carouselSnapInterval,
    );
    onViewerIndexChange(Math.max(0, Math.min(seats.length - 1, nextIndex)));
  };

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
    >
      <View className="flex-1 bg-[#FFFFFF]">
        <ViewerHeader onBack={onBack} />

        <FlatList
          contentContainerStyle={{
            paddingBottom: 20,
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 16,
          }}
          data={seats}
          decelerationRate="fast"
          getItemLayout={(_, index) => ({
            index,
            length: carouselSnapInterval,
            offset: carouselSnapInterval * index,
          })}
          horizontal
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={handleViewerScrollEnd}
          ref={viewerListRef}
          renderItem={({ item, index }) => (
            <TicketCard
              cardWidth={carouselCardWidth}
              index={index}
              seat={item}
            />
          )}
          showsHorizontalScrollIndicator={false}
          snapToAlignment="start"
          snapToInterval={carouselSnapInterval}
        />

        <Animated.View
          entering={FadeInUp.duration(260)}
          className="mt-auto items-center gap-[18px] px-4 pb-[22px]"
        >
          <View
            className="min-w-[78px] rounded-[18px] bg-white px-5 py-[9px]"
            style={softPillShadow}
          >
            <Text className="text-center text-[13px] font-bold leading-[15px] text-[#111111]">
              {`${viewerIndex + 1} of ${seats.length}`}
            </Text>
          </View>

          <View className="w-full flex-row justify-between">
            <Pressable
              accessibilityRole="button"
              className="h-[46px] w-[136px] flex-row items-center justify-center gap-2 rounded-[8px] bg-[#111111]"
            >
              <Ionicons color="#FFFFFF" name="wallet-outline" size={18} />
              <Text className="text-[12px] font-semibold leading-[14px] text-white">
                Add to Apple Wallet
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              className="h-[46px] w-[148px] flex-row items-center justify-center gap-2 rounded-[24px] border border-[#D7DBE2] bg-white"
            >
              <Ionicons
                color="#111111"
                name="information-circle-outline"
                size={18}
              />
              <Text className="text-[12px] font-semibold leading-[14px] text-[#111111]">
                Ticket Info
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
