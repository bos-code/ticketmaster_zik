import Head from "expo-router/head";
import { StatusBar, type StatusBarStyle } from "expo-status-bar";

type StatusBarChromeProps = {
  backgroundColor: string;
  style: StatusBarStyle;
};

export function StatusBarChrome({
  backgroundColor,
  style,
}: StatusBarChromeProps) {
  return (
    <>
      <Head>
        <meta name="theme-color" content={backgroundColor} />
      </Head>
      <StatusBar backgroundColor={backgroundColor} style={style} />
    </>
  );
}
