import React from "react";
import { Pressable, Text, View } from "react-native";

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
    <View className="border-b border-[#EFEFEF] bg-white">
      <View className="flex-row">
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
      accessibilityRole="button"
      onPress={onPress}
      className={cx(
        "flex-1 items-center justify-center border-b-[3px] pb-[22px] pt-[18px]",
        active ? "border-[#111111]" : "border-transparent",
      )}
    >
      <Text
        className={cx(
          "text-[15px] leading-[18px]",
          active ? "font-bold text-[#111111]" : "font-medium text-[#757575]",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
