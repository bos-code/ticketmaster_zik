import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StatusBarChrome } from "@/components/status-bar-chrome";

export default function TempFullBleedImageScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBarChrome
        backgroundColor="transparent"
        drawsBehindStatusBar
        style="light"
        useCustomAppearance
      />
      <Image
        contentFit="cover"
        source={{
          uri: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=88",
        }}
        style={[
          styles.image,
          {
            bottom: -insets.bottom,
            top: -insets.top,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#000000",
    flex: 1,
    overflow: "hidden",
  },
  image: {
    left: 0,
    position: "absolute",
    right: 0,
  },
});
