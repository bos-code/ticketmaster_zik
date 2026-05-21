import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { fonts } from "../../../theme/fonts";

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
            disabled={disabled}
            iconClassName="rotate-45"
            iconColor={disabled ? "#D1D5DB" : "#2B72D7"}
            iconName="arrow-up-outline"
            label="Transfer"
            labelColor={disabled ? "#D1D5DB" : "#2b2b2b"}
            onPress={onTransfer}
          />

          <View style={styles.divider} />

          <BottomDockAction
            iconClassName=""
            iconColor="#2B72D7"
            iconName="sync-outline"
            label="Sell"
            labelColor="#2b2b2b"
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
      style={styles.action}
      disabled={disabled}
      onPress={onPress}
    >
      <Ionicons
        className={iconClassName}
        color={iconColor}
        name={iconName}
        size={22}
      />
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
    height: 61,
    justifyContent: "center",
    paddingTop: 4,
    width: 82,
  },
  actionsRow: {
    alignItems: "center",
    flexDirection: "row",
    height: 62,
  },
  divider: {
    backgroundColor: "#E5E5E5",
    height: 38,
    width: StyleSheet.hairlineWidth,
  },
  dock: {
    borderRadius: 31,
    boxShadow: "0px 6px 14px rgba(0, 0, 0, 0.24)",
    elevation: 11,
    height: 62,
    width: 165,
  },
  dockDisabled: {
    opacity: 0.6,
  },
  dockPosition: {
    alignItems: "center",
    bottom: 53,
    left: 0,
    pointerEvents: "box-none",
    position: "absolute",
    right: 0,
    zIndex: 30,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 14,
    marginTop: 1,
  },
});
