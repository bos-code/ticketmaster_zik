import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { absoluteFill } from "@/components/tickets/ticketFlowConstants";
import { useTicketFlowData } from "@/components/tickets/useTicketFlowData";

export function CompactHeroHeader({
  onBack,
  onOpenViewer,
}: {
  onBack: () => void;
  onOpenViewer?: () => void;
}) {
  const { event } = useTicketFlowData();

  return (
    <View className="overflow-hidden bg-[#050505]">
      <SafeAreaView edges={["top"]} style={{ backgroundColor: "#050505" }}>
        <View className="relative min-h-[106px] overflow-hidden">
          <Image contentFit="cover" source={{ uri: event.imageUrl }} style={absoluteFill} />
          <View className="absolute inset-0 bg-[rgba(3,3,6,0.56)]" />

          <View className="relative flex-1 justify-center px-4">
            <View className="min-h-[44px] flex-row items-center justify-between">
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={onBack}
                className="h-10 w-10 items-center justify-center rounded-full bg-[rgba(0,0,0,0.30)]"
              >
                <Ionicons color="#FFFFFF" name="arrow-back" size={20} />
              </Pressable>

              <View className="absolute left-14 right-14 items-center">
                <Text numberOfLines={1} className="text-center text-[13px] font-extrabold leading-[16px] text-white">
                  {event.title}
                </Text>
                <Text numberOfLines={1} className="mt-[2px] text-center text-[11px] font-normal leading-[13px] text-[rgba(255,255,255,0.84)]">
                  {event.venue}
                </Text>
              </View>

              {onOpenViewer ? (
                <Pressable
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={onOpenViewer}
                  className="h-11 w-11 items-center justify-center rounded-[14px] bg-[#0B55F5]"
                >
                  <Ionicons color="#FFFFFF" name="barcode-outline" size={20} />
                </Pressable>
              ) : (
                <View className="h-10 w-10" />
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
