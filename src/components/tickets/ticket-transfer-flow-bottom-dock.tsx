import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

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
  return (
    <Animated.View
      entering={FadeInUp.duration(320).delay(220)}
      style={styles.dockPosition}
    >
      <View
        className="overflow-hidden border border-white bg-white"
        style={[
          styles.dock,
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

          <View style={styles.divider} />

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
        <TicketTransferIcon color={iconColor} size={27} />
      ) : (
        <TicketResaleIcon color={iconColor} size={27} />
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
    height: 76,
    justifyContent: "center",
    paddingTop: 5,
    width: 94,
  },
  actionsRow: {
    alignItems: "center",
    flexDirection: "row",
    height: 76,
  },
  divider: {
    backgroundColor: "#E5E5E5",
    height: 48,
    width: StyleSheet.hairlineWidth,
  },
  dock: {
    borderRadius: 38,
    boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.20)",
    elevation: 11,
    height: 76,
    width: 189,
  },
  dockDisabled: {
    opacity: 0.6,
  },
  dockPosition: {
    alignItems: "center",
    bottom: 64,
    left: 0,
    pointerEvents: "box-none",
    position: "absolute",
    right: 0,
    zIndex: 30,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
});
