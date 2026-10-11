import { Text } from '@/components/ui/app-text';
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

import { EXTRA_CARDS } from "@/components/tickets/ticketFlowConstants";
import { MapPreviewCard } from "@/components/tickets/ticket-transfer-flow-map-preview-card";

export function ExtrasPanel() {
  return (
    <View className="bg-[#111111] px-4 pb-10 pt-5">
      <View className="gap-3">
        {EXTRA_CARDS.map((card) => (
          <View
            className="rounded-[4px] border border-[#333333] bg-[#242424] px-4 py-4"
            key={card.id}
          >
            <View className="flex-row items-start gap-3">
              <View className="mt-[2px] h-9 w-9 items-center justify-center rounded-full bg-[#111111]">
                <Ionicons color="#0F56F4" name={card.icon} size={18} />
              </View>

              <View className="flex-1 gap-1">
                <Text className="text-[15px] font-bold leading-[18px] text-white">
                  {card.title}
                </Text>
                <Text className="text-[13px] font-normal leading-[18px] text-[#BBBBBB]">
                  {card.body}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <MapPreviewCard />
    </View>
  );
}
