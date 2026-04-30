import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text } from "react-native";

export function BackLink({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center gap-[2px]"
      onPress={onPress}
    >
      <Ionicons color="#2A84C6" name="chevron-back" size={17} />
      <Text className="text-[12px] font-medium leading-[14px] text-[#2A84C6]">
        BACK
      </Text>
    </Pressable>
  );
}
