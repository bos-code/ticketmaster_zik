import { ScrollViewStyleReset } from 'expo-router/html';
import React, { type PropsWithChildren } from 'react';

const APP_THEME_COLOR = '#050505';

export default function RootHtml({ children }: PropsWithChildren) {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
        <meta name='theme-color' content={APP_THEME_COLOR} />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta
          name='apple-mobile-web-app-status-bar-style'
          content='black-translucent'
        />
        <meta name='color-scheme' content='dark' />
        <meta name='format-detection' content='telephone=no' />
        <meta name='application-name' content='Tickets' />
        <meta name='apple-mobile-web-app-title' content='Tickets' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1.0, viewport-fit=cover'
        />
        <link rel='manifest' href='/manifest.json' />
        <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
        {__DEV__ && <script dangerouslySetInnerHTML={{ __html: `
          (async function () {
            try {
              // Runs before the app imports: an old worker can serve a stale
              // Metro bundle and crash before RootLayout effects ever execute.
              var removedWorker = false;
              if ('serviceWorker' in navigator) {
                var registrations = await navigator.serviceWorker.getRegistrations();
                for (var registration of registrations) {
                  var worker = registration.active || registration.waiting || registration.installing;
                  if (worker && new URL(worker.scriptURL).pathname === '/service-worker.js') {
                    removedWorker = (await registration.unregister()) || removedWorker;
                  }
                }
              }
              if ('caches' in window) {
                var keys = await caches.keys();
                await Promise.all(keys.filter(function (key) {
                  return key.indexOf('ticketmaster-zik-') === 0;
                }).map(function (key) { return caches.delete(key); }));
              }
              if (removedWorker && navigator.serviceWorker.controller) {
                window.location.reload();
              }
            } catch (_) {}
          })();
        ` }} />}
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

            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
