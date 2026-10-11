import { Text } from '@/components/ui/app-text';
import React from "react";
import { Pressable, View } from "react-native";

import {
  cx,
} from "@/components/tickets/cx";
import type { PanelTab } from "@/components/tickets/ticketFlowTypes";

export function PanelTabs({
  activePanel,
  onChange,
}: {
  activePanel: PanelTab;
  onChange: (value: PanelTab) => void;
}) {
  return (
    <View className="bg-[#111111] px-[15px]">
      <View className="flex-row gap-2">
        <PanelTabButton
          active={activePanel === "tickets"}
          label="Tickets"
          onPress={() => onChange("tickets")}
        />
        <PanelTabButton
          active={activePanel === "extras"}
          label="Extras"
          onPress={() => onChange("extras")}
        />
      </View>
    </View>
  );
}

function PanelTabButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={cx(
        "min-h-[60px] flex-1 items-center justify-center border-b-[3px] py-4",
        active ? "border-white" : "border-[#414141]",
      )}
    >
      <Text
        className={cx(
          "text-[15px] leading-[18px]",
          active ? "font-bold text-white" : "font-medium text-[#A5A5A5]",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
