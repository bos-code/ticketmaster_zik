import { Image, type ImageProps } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ImmersiveInsets = {
  bottom: number;
  left: number;
  right: number;
  top: number;
};

type EdgeToEdgeHeroMediaProps = {
  height: number;
  source: ImageProps["source"];
};

const EMPTY_INSETS: ImmersiveInsets = {
  bottom: 0,
  left: 0,
  right: 0,
  top: 0,
};

export function useImmersiveSafeAreaInsets() {
  const nativeInsets = useSafeAreaInsets();
  const webInsets = useWebSafeAreaInsets();

  return Platform.OS === "web" ? webInsets : nativeInsets;
}

export function EdgeToEdgeHeroMedia({
  height,
  source,
}: EdgeToEdgeHeroMediaProps) {
  return (
    <>
      <Image
        contentFit="cover"
        source={source}
        style={{ height, width: "100%" }}
      />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.3)"]}
        locations={[0, 1]}
        pointerEvents="none"
        style={{
          height,
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      />
    </>
  );
}

function useWebSafeAreaInsets() {
  const [safeAreaInsets, setSafeAreaInsets] =
    useState<ImmersiveInsets>(EMPTY_INSETS);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") {
      return;
    }

    const measureSafeAreaInsets = () => {
      const styles = window.getComputedStyle(document.documentElement);
      setSafeAreaInsets({
        bottom: readCssPx(styles, "--safe-area-bottom"),
        left: readCssPx(styles, "--safe-area-left"),
        right: readCssPx(styles, "--safe-area-right"),
        top: readCssPx(styles, "--safe-area-top"),
      });
    };

    measureSafeAreaInsets();
    window.addEventListener("resize", measureSafeAreaInsets);
    window.visualViewport?.addEventListener("resize", measureSafeAreaInsets);

    return () => {
      window.removeEventListener("resize", measureSafeAreaInsets);
      window.visualViewport?.removeEventListener(
        "resize",
        measureSafeAreaInsets,
      );
    };
  }, []);

  return safeAreaInsets;
}

function readCssPx(styles: CSSStyleDeclaration, property: string) {
  const value = Number.parseFloat(styles.getPropertyValue(property));
  return Number.isFinite(value) ? value : 0;
}
