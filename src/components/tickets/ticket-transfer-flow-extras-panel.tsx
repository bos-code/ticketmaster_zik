import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

import {
  EXTRA_CARDS,
} from "@/components/tickets/ticket-flow-shared";
import { MapPreviewCard } from "@/components/tickets/ticket-transfer-flow-map-preview-card";

export function ExtrasPanel({
  onOpenDirections,
}: {
  onOpenDirections: () => void;
}) {
  return (
    <View className="bg-white px-4 pb-10 pt-5">
      <View className="gap-3">
        {EXTRA_CARDS.map((card) => (
          <View
            className="rounded-[4px] border border-[#EFE8E3] bg-[#F8F5F3] px-4 py-4"
            key={card.id}
          >
            <View className="flex-row items-start gap-3">
              <View className="mt-[2px] h-9 w-9 items-center justify-center rounded-full bg-white">
                <Ionicons color="#0F56F4" name={card.icon} size={18} />
              </View>

              <View className="flex-1 gap-1">
                <Text className="text-[15px] font-bold leading-[18px] text-[#161616]">
                  {card.title}
                </Text>
                <Text className="text-[13px] font-normal leading-[18px] text-[#5B6470]">
                  {card.body}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <MapPreviewCard onOpenDirections={onOpenDirections} />
    </View>
  );
}
