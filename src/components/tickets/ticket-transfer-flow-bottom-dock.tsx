import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

export function BottomDock({ onTransfer }: { onTransfer: () => void }) {
  return (
    <Animated.View
      entering={FadeInUp.duration(320).delay(220)}
      pointerEvents="box-none"
      className="absolute inset-x-0 bottom-4 z-30 items-center"
    >
      <View
        className="overflow-hidden rounded-[30px] border border-white bg-white"
        style={[
          {
            minWidth: 176,
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
          },
        ]}
      >
        <View className="flex-row items-center">
          <BottomDockAction
            iconClassName="rotate-45"
            iconColor="#2B72D7"
            iconName="arrow-up-outline"
            label="Transfer"
            labelColor="#2B72D7"
            onPress={onTransfer}
          />

          <View className="mx-[2px] h-4/6 w-px rounded-2xl bg-[#E5E7EB]" />

          <BottomDockAction
            disabled
            iconClassName="-rotate-90"
            iconColor="#D1D5DB"
            iconName="pricetag-outline"
            label="Sell"
            labelColor="#D1D5DB"
          />
        </View>
      </View>
    </Animated.View>
  );
}

function BottomDockAction({
  disabled,
  iconClassName,
  iconColor,
  iconName,
  label,
  labelColor,
  onPress,
}: {
  disabled?: boolean;
  iconClassName: string;
  iconColor: string;
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  labelColor: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className="min-h-[42px] min-w-[76px] items-center justify-center"
      disabled={disabled}
      onPress={onPress}
    >
      <Ionicons
        className={iconClassName}
        color={iconColor}
        name={iconName}
        size={13}
      />
      <Text
        className="text-[10px] font-medium leading-[12px]"
        style={{ color: labelColor }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
