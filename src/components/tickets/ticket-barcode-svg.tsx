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
        preserveAspectRatio="none"
        viewBox="50 131 1504 252"
        width="100%"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  artwork: {
    height: 90,
    overflow: "hidden",
    width: "100%",
  },
});
