import React, { memo } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import BarcodeArtwork from "../../../public/image.svg";

type TicketBarcodeSvgProps = {
  style?: StyleProp<ViewStyle>;
};

export const TicketBarcodeSvg = memo(function TicketBarcodeSvg({
  style,
}: TicketBarcodeSvgProps) {
  return (
    <View pointerEvents="none" style={[styles.artwork, style]}>
      <BarcodeArtwork
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  artwork: {
    height: 90,
    width: "100%",
  },
});
