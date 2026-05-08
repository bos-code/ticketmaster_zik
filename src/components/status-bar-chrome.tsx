import Head from "expo-router/head";
import { StatusBar, type StatusBarStyle } from "expo-status-bar";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppStore } from "@/store/use-app-store";

type StatusBarChromeProps = {
  backgroundColor?: string;
  drawsBehindStatusBar?: boolean;
  style?: StatusBarStyle;
  useCustomAppearance?: boolean;
};

export const SPLASH_STATUS_BAR_COLOR = "#007AFF";

export function StatusBarChrome({
  backgroundColor = "#000000",
  drawsBehindStatusBar = false,
  style = "light",
  useCustomAppearance = false,
}: StatusBarChromeProps) {
  const insets = useSafeAreaInsets();
  const hasFinishedStartup = useAppStore((state) => state.hasFinishedStartup);
  const isStartupLocked = !hasFinishedStartup;
  const resolvedBackgroundColor = isStartupLocked
    ? SPLASH_STATUS_BAR_COLOR
    : useCustomAppearance
      ? backgroundColor
      : "#000000";
  const resolvedStyle = isStartupLocked
    ? "light"
    : useCustomAppearance
      ? style
      : "light";
  const topInsetHeight = Platform.OS === "web" ? 0 : insets.top;
  const shouldDrawBehindStatusBar = drawsBehindStatusBar && !isStartupLocked;
  const shouldRenderStatusBarFill =
    topInsetHeight > 0 && !shouldDrawBehindStatusBar;

  return (
    <>
      <Head>
        <meta name="theme-color" content={resolvedBackgroundColor} />
      </Head>
      {shouldRenderStatusBarFill ? (
        <View
          pointerEvents="none"
          style={{
            backgroundColor: resolvedBackgroundColor,
            height: topInsetHeight,
            left: 0,
            position: "absolute",
            right: 0,
            top: 0,
            zIndex: 9999,
          }}
        />
      ) : null}
      <StatusBar
        backgroundColor={resolvedBackgroundColor}
        style={resolvedStyle}
        translucent={shouldDrawBehindStatusBar}
      />
    </>
  );
}
