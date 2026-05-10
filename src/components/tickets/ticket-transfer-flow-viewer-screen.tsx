import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  FlatList,
  Pressable,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppleWalletIcon } from "@/components/tickets/apple-wallet-icon";
import { EditableText } from "@/components/tickets/EditableText";
import { ExtrasPanel } from "@/components/tickets/ticket-transfer-flow-extras-panel";
import {
  softPillShadow,
} from "@/components/tickets/ticketFlowConstants";
import type { Seat } from "@/components/tickets/ticketFlowTypes";
import { useTicketFlowData } from "@/components/tickets/useTicketFlowData";
import { BottomDrawer } from "@/components/ui/bottom-drawer";
import { TicketCard } from "./ticket-card";
import { StatusBarChrome } from "@/components/status-bar-chrome";

function ViewerHeader({ onBack }: { onBack: () => void }) {
  const { event } = useTicketFlowData();

  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: "#F9F8F4" }}>
      <View className="flex-row items-center bg-[#F9F8F4] px-5 py-2">
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBack}
          className="mr-2"
        >
          <Ionicons color="#000000" name="chevron-back" size={28} />
        </Pressable>

        <View className="justify-center">
          <EditableText field="eventName" value={event.shortTitle} className="text-[17px] font-bold text-[#000000]" />
          <EditableText value={event.headerSubtitle} className="text-[12px] font-medium text-[#6B6B6B]" />
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
  positionLabel,
  seats,
  viewerIndex,
}: {
  carouselCardWidth: number;
  carouselSnapInterval: number;
  onBack: () => void;
  onViewerIndexChange: (index: number) => void;
  positionLabel?: string;
  seats: Seat[];
  viewerIndex: number;
}) {
  const viewerListRef = useRef<FlatList<Seat>>(null);
  const [isTicketInfoOpen, setIsTicketInfoOpen] = React.useState(false);

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
    updateViewerIndexFromOffset(event.nativeEvent.contentOffset.x);
  };

  function updateViewerIndexFromOffset(offsetX: number) {
    const nextIndex = Math.round(
      offsetX / carouselSnapInterval,
    );
    const clampedIndex = Math.max(0, Math.min(seats.length - 1, nextIndex));

    if (clampedIndex !== viewerIndex) {
      onViewerIndexChange(clampedIndex);
    }
  }

  const { width } = useWindowDimensions();
  const screenWidth = Math.min(width, 430);
  const sidePadding = (screenWidth - carouselCardWidth) / 2;

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={{ flex: 1, backgroundColor: "#F9F8F4" }}
    >
      <StatusBarChrome backgroundColor="#F9F8F4" style="dark" />
      <View className="flex-1 bg-[#F9F8F4]">
        <ViewerHeader onBack={onBack} />

        <FlatList
          contentContainerStyle={{
            paddingBottom: 20,
            paddingLeft: sidePadding,
            paddingRight: sidePadding,
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
          onScroll={(event) => {
            updateViewerIndexFromOffset(event.nativeEvent.contentOffset.x);
          }}
          ref={viewerListRef}
          renderItem={({ item, index }) => (
            <TicketCard
              cardWidth={carouselCardWidth}
              index={index}
              seat={item}
            />
          )}
          showsHorizontalScrollIndicator={false}
          snapToAlignment="center"
          snapToInterval={carouselSnapInterval}
        />

        <Animated.View
          entering={FadeInUp.duration(260)}
          className="mt-auto items-center gap-10 px-5 pb-8"
        >
          <View
            className="rounded-full bg-white px-5 py-[10px]"
            style={softPillShadow}
          >
            <Text className="text-center text-[12px] font-bold text-[#111111]">
              {positionLabel ?? `${viewerIndex + 1} of ${seats.length}`}
            </Text>
          </View>

          <View className="flex-row w-full justify-between gap-3 px-2">
            <Pressable
              accessibilityRole="button"
              className="h-[44px] flex-row items-center justify-center gap-2 rounded-[8px] bg-[#111111] px-4"
            >
              <AppleWalletIcon height={24} width={34} />
              <View className="flex flex-col items-center" >
                <Text className="text-[8px] font-medium text-white leading-tight">Add to</Text>
                <Text className="text-[12px] font-bold text-white leading-tight">Apple Wallet</Text>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              className="h-[44px] flex-row items-center justify-center gap-2 rounded-full border border-[#D7DBE2] bg-[#F9F8F4] px-4"
              onPress={() => setIsTicketInfoOpen(true)}
            >
              <View className="h-6 w-6 items-center justify-center rounded-full bg-black">
                  <Ionicons
                    color="#FFFFFF"
                    name="information"
                    size={15}
                  />
              </View>
              <Text className="text-[13px] font-bold text-[#111111]">
                Ticket Info
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
      <BottomDrawer
        minHeight="62%"
        onClose={() => setIsTicketInfoOpen(false)}
        visible={isTicketInfoOpen}
      >
        <View className="border-b border-[#F0F0F0] px-5 py-4">
          <Text className="text-center text-[12px] font-medium leading-[15px] text-[#70757E]">
            TICKET INFO
          </Text>
        </View>
        <ExtrasPanel />
      </BottomDrawer>
    </SafeAreaView>
  );
}
