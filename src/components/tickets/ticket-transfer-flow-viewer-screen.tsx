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

import {
  softPillShadow,
} from "@/components/tickets/ticketFlowConstants";
import type { Seat } from "@/components/tickets/ticketFlowTypes";
import { AppleWalletIcon } from "@/components/tickets/apple-wallet-icon";
import { ExtrasPanel } from "@/components/tickets/ticket-transfer-flow-extras-panel";
import { BottomDrawer } from "@/components/ui/bottom-drawer";
import { TicketCard } from "./ticket-card";

function ViewerHeader({ onBack }: { onBack: () => void }) {
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
          <Text className="text-[17px] font-bold text-[#000000]">
            Don Toliver: Octane Tour
          </Text>
          <Text className="text-[12px] font-medium text-[#6B6B6B]">
            7:30 PM - Madison Square Garden
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
  onOpenDirections,
  onViewerIndexChange,
  seats,
  viewerIndex,
}: {
  carouselCardWidth: number;
  carouselSnapInterval: number;
  onBack: () => void;
  onOpenDirections: () => void;
  onViewerIndexChange: (index: number) => void;
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
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / carouselSnapInterval,
    );
    onViewerIndexChange(Math.max(0, Math.min(seats.length - 1, nextIndex)));
  };

  const { width } = useWindowDimensions();
  const screenWidth = Math.min(width, 430);
  const sidePadding = (screenWidth - carouselCardWidth) / 2;

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={{ flex: 1, backgroundColor: "#F9F8F4" }}
    >
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
              {`${viewerIndex + 1} of ${seats.length}`}
            </Text>
          </View>

          <View className="w-full flex-row justify-between gap-3 px-2">
            <Pressable
              accessibilityRole="button"
              className="h-[44px] flex-1 flex-row items-center justify-center gap-2 rounded-[8px] bg-[#111111]"
            >
              <AppleWalletIcon height={24} width={34} />
              <View>
                <Text className="text-[8px] font-medium text-white leading-tight">Add to</Text>
                <Text className="text-[12px] font-bold text-white leading-tight">Apple Wallet</Text>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              className="h-[44px] flex-1 flex-row items-center justify-center gap-2 rounded-full border border-[#D7DBE2] bg-[#F9F8F4]"
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
        <ExtrasPanel onOpenDirections={onOpenDirections} />
      </BottomDrawer>
    </SafeAreaView>
  );
}
