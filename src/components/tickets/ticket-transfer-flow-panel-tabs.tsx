import React from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";

import { cx } from "@/components/tickets/cx";
import {
  getTicketFlowHorizontalGutter,
  getTicketFlowPanelTabHeight,
  scaleTicketReferenceMetric,
} from "@/components/tickets/ticketFlowConstants";
import type { PanelTab } from "@/components/tickets/ticketFlowTypes";
import { fonts } from "../../../theme/fonts";

export function PanelTabs({
  activePanel,
  onChange,
}: {
  activePanel: PanelTab;
  onChange: (value: PanelTab) => void;
}) {
  const { width } = useWindowDimensions();
  const horizontalGutter = getTicketFlowHorizontalGutter(width);
  const tabHeight = getTicketFlowPanelTabHeight(width);
  const tabFontSize = scaleTicketReferenceMetric(width, 22, 12, 13);

  return (
    <View
      className="border-b border-[#E3E3E3] bg-white"
      style={{ paddingHorizontal: horizontalGutter }}
    >
      <View className="flex-row">
        <PanelTabButton
          active={activePanel === "tickets"}
          fontSize={tabFontSize}
          height={tabHeight}
          label="Tickets"
          onPress={() => onChange("tickets")}
        />
        <PanelTabButton
          active={activePanel === "extras"}
          fontSize={tabFontSize}
          height={tabHeight}
          label="Extras"
          onPress={() => onChange("extras")}
        />
      </View>
    </View>
  );
}

function PanelTabButton({
  active,
  fontSize,
  height,
  label,
  onPress,
}: {
  active: boolean;
  fontSize: number;
  height: number;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={{ height }}
      className={cx(
        "flex-1 items-center justify-center border-b-2",
        active ? "border-[#111111]" : "border-transparent",
      )}
    >
      <Text
        className={cx(
          "leading-[18px]",
          active ? "font-bold text-[#111111]" : "font-medium text-[#757575]",
        )}
        style={{
          fontFamily: active ? fonts.bold : fonts.regular,
          fontSize,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
