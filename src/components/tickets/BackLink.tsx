import { Text } from '@/components/ui/app-text';
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable } from "react-native";

import { useDrawerTheme } from "@/components/ui/drawer-theme";

export function BackLink({ onPress }: { onPress: () => void }) {
  const { colors } = useDrawerTheme();

  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center gap-[2px]"
      onPress={onPress}
    >
      <Ionicons color={colors.link} name="chevron-back" size={17} />
      <Text className="text-[12px] font-medium leading-[14px]" style={{ color: colors.link }}>
        BACK
      </Text>
    </Pressable>
  );
}
