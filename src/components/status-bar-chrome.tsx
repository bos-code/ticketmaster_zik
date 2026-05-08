import Head from "expo-router/head";
import { StatusBar, type StatusBarStyle } from "expo-status-bar";

type StatusBarChromeProps = {
  backgroundColor?: string;
  style?: StatusBarStyle;
  useCustomAppearance?: boolean;
};

export function StatusBarChrome({
  backgroundColor = "#000000",
  style = "light",
  useCustomAppearance = false,
}: StatusBarChromeProps) {
  const resolvedBackgroundColor = useCustomAppearance
    ? backgroundColor
    : "#000000";
  const resolvedStyle = useCustomAppearance ? style : "light";

  return (
    <>
      <Head>
        <meta name="theme-color" content={resolvedBackgroundColor} />
      </Head>
      <StatusBar
        backgroundColor={resolvedBackgroundColor}
        style={resolvedStyle}
      />
    </>
  );
}
