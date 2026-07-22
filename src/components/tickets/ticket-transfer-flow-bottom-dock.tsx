import React from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { useImmersiveSafeAreaInsets } from "@/components/immersive/edge-to-edge-hero";
import { fonts } from "../../../theme/fonts";
import {
  TicketResaleIcon,
  TicketTransferIcon,
} from "@/components/tickets/ticket-transfer-flow-icons";

export function BottomDock({
  disabled,
  onTransfer,
}: {
  disabled?: boolean;
  onTransfer: () => void;
}) {
  const insets = useImmersiveSafeAreaInsets();
  const { width } = useWindowDimensions();
  const dockHeight = Math.round(Math.min(56, Math.max(48, width * 0.128)));
  const dockWidth = Math.round(Math.min(194, Math.max(169, width * 0.452)));
  const dockBottom = Math.max(12, insets.bottom - 2);

  return (
    <Animated.View
      entering={FadeInUp.duration(320).delay(220)}
      style={[styles.dockPosition, { bottom: dockBottom }]}
    >
      <View
        className="overflow-hidden border border-white bg-white"
        style={[
          styles.dock,
          {
            borderRadius: dockHeight / 2,
            height: dockHeight,
            width: dockWidth,
          },
          disabled ? styles.dockDisabled : null,
        ]}
      >
        <View style={styles.actionsRow}>
          <BottomDockAction
            accessibilityLabel="Transfer tickets"
            disabled={disabled}
            iconColor={disabled ? "#D1D5DB" : "#2B72D7"}
            icon="transfer"
            label="Transfer"
            labelColor={disabled ? "#D1D5DB" : "#2b2b2b"}
            onPress={onTransfer}
          />

          <View style={[styles.divider, { height: Math.round(dockHeight * 0.63) }]} />

          <BottomDockAction
            accessibilityLabel="Sell tickets"
            iconColor="#6D6D6D"
            icon="sell"
            label="Sell"
            labelColor="#2b2b2b"
          />
        </View>
      </View>
    </Animated.View>
  );
}

function BottomDockAction({
  accessibilityLabel,
  disabled,
  iconColor,
  icon,
  label,
  labelColor,
  onPress,
}: {
  accessibilityLabel: string;
  disabled?: boolean;
  iconColor: string;
  icon: "sell" | "transfer";
  label: string;
  labelColor: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={styles.action}
      disabled={disabled}
      onPress={onPress}
    >
      {icon === "transfer" ? (
        <TicketTransferIcon color={iconColor} size={24} />
      ) : (
        <TicketResaleIcon color={iconColor} size={24} />
      )}
      <Text
        style={[styles.label, { color: labelColor }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    flex: 1,
    height: "100%",
    justifyContent: "center",
    paddingTop: 4,
  },
  actionsRow: {
    alignItems: "center",
    flexDirection: "row",
    height: "100%",
    width: "100%",
  },
  divider: {
    backgroundColor: "#E5E5E5",
    width: StyleSheet.hairlineWidth,
  },
  dock: {
    boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.20)",
    elevation: 11,
  },
  dockDisabled: {
    opacity: 0.6,
  },
  dockPosition: {
    alignItems: "center",
    left: 0,
    pointerEvents: "box-none",
    position: "absolute",
    right: 0,
    zIndex: 30,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    marginTop: 1,
  },
});
