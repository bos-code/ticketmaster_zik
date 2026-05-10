import Head from "expo-router/head";
import { StatusBar, type StatusBarStyle } from "expo-status-bar";
import { Platform, StatusBar as NativeStatusBar, View } from "react-native";
import { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppStore } from "@/store/use-app-store";

type StatusBarChromeProps = {
  backgroundColor?: string;
  drawsBehindStatusBar?: boolean;
  style?: StatusBarStyle;
  useCustomAppearance?: boolean;
};

export const APP_STATUS_BAR_BLACK = "#050505";
export const SPLASH_STATUS_BAR_COLOR = "#007AFF";
const STATUS_BAR_FILL_OVERLAP = 50;

export function StatusBarChrome({
  backgroundColor = APP_STATUS_BAR_BLACK,
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
      : APP_STATUS_BAR_BLACK;
  // On web, we only want the splash blue during the initial startup lock
  const webThemeColor = (Platform.OS === 'web' && !isStartupLocked) 
    ? APP_STATUS_BAR_BLACK 
    : resolvedBackgroundColor;
  const resolvedStyle = isStartupLocked
    ? "light"
    : useCustomAppearance
      ? style
      : "light";
  const topInsetHeight = Platform.OS === "web" ? 0 : insets.top;
  const shouldDrawBehindStatusBar = drawsBehindStatusBar && !isStartupLocked;
  const shouldRenderStatusBarFill =
    topInsetHeight > 0 && !shouldDrawBehindStatusBar;
  const appleStatusBarStyle = shouldDrawBehindStatusBar
    ? "black-translucent"
    : resolvedStyle === "dark"
      ? "default"
      : "black";

  useEffect(() => {
    if (Platform.OS !== "web") {
      NativeStatusBar.setBarStyle(
        resolvedStyle === "dark" ? "dark-content" : "light-content",
        true,
      );

      if (Platform.OS === "android") {
        NativeStatusBar.setTranslucent(shouldDrawBehindStatusBar);
        NativeStatusBar.setBackgroundColor(
          shouldDrawBehindStatusBar ? "transparent" : resolvedBackgroundColor,
          true,
        );
      }
    }

    if (Platform.OS !== "web" || typeof document === "undefined") {
      return;
    }

    const setMeta = (selector: string, name: string, content: string) => {
      let meta = document.head.querySelector<HTMLMetaElement>(selector);

      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(
          selector.includes("property=") ? "property" : "name",
          name,
        );
        document.head.appendChild(meta);
      }

      meta.setAttribute("content", content);
    };

    setMeta('meta[name="theme-color"]', "theme-color", webThemeColor);
    setMeta(
      'meta[name="apple-mobile-web-app-capable"]',
      "apple-mobile-web-app-capable",
      "yes",
    );
    setMeta(
      'meta[name="mobile-web-app-capable"]',
      "mobile-web-app-capable",
      "yes",
    );
    setMeta(
      'meta[name="apple-mobile-web-app-status-bar-style"]',
      "apple-mobile-web-app-status-bar-style",
      appleStatusBarStyle,
    );
  }, [
    appleStatusBarStyle,
    resolvedBackgroundColor,
    resolvedStyle,
    shouldDrawBehindStatusBar,
    webThemeColor,
  ]);

  return (
    <>
      <Head>
        <meta name="theme-color" content={webThemeColor} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content={appleStatusBarStyle}
        />
      </Head>
      {shouldRenderStatusBarFill ? (
        <View
          pointerEvents="none"
          style={{
            backgroundColor: resolvedBackgroundColor,
            height: topInsetHeight + STATUS_BAR_FILL_OVERLAP,
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
