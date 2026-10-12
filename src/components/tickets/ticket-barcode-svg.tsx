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
        viewBox="40 124 1524 264"
        width="100%"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  artwork: {
    // The source SVG includes large white margins above and below the code.
    // Use the ink's viewport so the complete code fills its responsive band.
    aspectRatio: 1524 / 264,
    width: "100%",
  },
});
