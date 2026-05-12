import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

const APP_THEME_COLOR = "#050505";

export default function RootHtml({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no"
        />
        <meta name="theme-color" content={APP_THEME_COLOR} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="application-name" content="Tickets" />
        <meta name="apple-mobile-web-app-title" content="Tickets" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var navigatorWithStandalone = window.navigator;
                  var isStandalone =
                    navigatorWithStandalone.standalone === true ||
                    (window.matchMedia &&
                      (window.matchMedia("(display-mode: standalone)").matches ||
                        window.matchMedia("(display-mode: fullscreen)").matches));

                  if (isStandalone) {
                    document.documentElement.classList.add("is-standalone-pwa");
                  }
                } catch (_) {}
              })();
            `,
          }}
        />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root {
                background: ${APP_THEME_COLOR};
                min-height: 100%;
                overscroll-behavior: none;
                touch-action: manipulation;
              }
              body {
                margin: 0;
                -webkit-font-smoothing: antialiased;
                -webkit-tap-highlight-color: transparent;
              }
              html.is-standalone-pwa,
              html.is-standalone-pwa body {
                background: #FFFFFF;
                height: 100%;
                min-height: 100%;
              }
              html.is-standalone-pwa #root {
                background: #FFFFFF;
                bottom: 0;
                height: auto;
                left: 0;
                overflow: hidden;
                position: fixed;
                right: 0;
                top: 0;
                width: 100vw;
              }
              @media (display-mode: standalone), (display-mode: fullscreen) {
                html, body {
                  height: 100%;
                  min-height: 100%;
                }
                #root {
                  bottom: 0;
                  height: auto;
                  left: 0;
                  overflow: hidden;
                  position: fixed;
                  right: 0;
                  top: 0;
                  width: 100vw;
                }
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
