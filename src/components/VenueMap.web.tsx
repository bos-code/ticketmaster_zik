import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

type VenueMapProps = {
  latitude: number;
  longitude: number;
  shouldResolveInitialAddress?: boolean;
  venueAddress?: string;
  venueName: string;
};

export default function VenueMap({
  latitude,
  longitude,
  venueAddress,
  venueName,
}: VenueMapProps) {
  const html = useMemo(
    () =>
      buildVenueMapHtml({
        latitude,
        longitude,
        venueAddress,
        venueName,
      }),
    [latitude, longitude, venueAddress, venueName],
  );

  return (
    <View style={styles.root}>
      {React.createElement("iframe", {
        referrerPolicy: "no-referrer-when-downgrade",
        srcDoc: html,
        style: iframeStyle,
        title: `${venueName} map`,
        allowFullScreen: true,
      })}
    </View>
  );
}

function buildVenueMapHtml({
  latitude,
  longitude,
  venueAddress,
  venueName,
}: {
  latitude: number;
  longitude: number;
  venueAddress?: string;
  venueName: string;
}) {
  const boot = JSON.stringify({
    center: [longitude, latitude],
    name: venueName,
    address: venueAddress || venueName,
  }).replace(/</g, "\\u003c");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" rel="stylesheet" />
  <style>
    html, body { height: 100%; margin: 0; width: 100%; }
    body { background: #F7F5EC; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif; }
    #map { height: 100%; width: 100%; }
    .maplibregl-ctrl-logo, .maplibregl-ctrl-attrib { display: none !important; }
    
    .pin {
      background: #6B4FBB;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      box-shadow: 0px 2px 8px rgba(0,0,0,0.2);
      height: 32px;
      width: 32px;
      animation: markerPulse 2s ease-in-out infinite;
      transform: translate(-50%, -50%) translateZ(0);
      will-change: transform;
    }

    @keyframes markerPulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1) translateZ(0); }
      50% { transform: translate(-50%, -50%) scale(1.1) translateZ(0); }
    }

    .map-controls {
      position: absolute;
      top: 16px;
      right: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 20;
    }
    .map-control-group {
      background: #FFFFFF;
      border-radius: 8px;
      box-shadow: 0px 2px 8px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .map-btn {
      width: 44px;
      height: 44px;
      background: transparent;
      border: none;
      font-size: 24px;
      font-weight: 500;
      color: #1A1A1A;
      cursor: pointer;
      transition: background 200ms ease;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }
    .map-btn:hover {
      background: #F5F5F5;
    }
    .map-btn:active {
      background: #EEEEEE;
    }
    .map-divider {
      height: 1px;
      background: #E5E5E5;
      width: 100%;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="map-controls">
    <div class="map-control-group">
      <button class="map-btn" onclick="map.zoomIn()" aria-label="Zoom in">+</button>
      <div class="map-divider"></div>
      <button class="map-btn" onclick="map.zoomOut()" aria-label="Zoom out">−</button>
    </div>
    <div class="map-control-group">
      <button class="map-btn" onclick="toggleFullscreen()" aria-label="View fullscreen">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 9V5h4"></path>
          <path d="M19 9V5h-4"></path>
          <path d="M5 15v4h4"></path>
          <path d="M19 15v4h-4"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>
    </div>
  </div>
  <script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
  <script>
    const BOOT = ${boot};
    const map = new maplibregl.Map({
      attributionControl: false,
      bearing: 0,
      center: BOOT.center,
      container: 'map',
      maxPitch: 45,
      pitch: 24,
      style: 'https://tiles.openfreemap.org/styles/bright',
      zoom: 15.5
    });

    window.map = map;

    window.toggleFullscreen = function() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.log('Error attempting to enable fullscreen: ' + err.message);
        });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    };

    map.on('load', () => {
      const el = document.createElement('div');
      el.className = 'pin';
      new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat(BOOT.center).addTo(map);
      (map.getStyle().layers || []).forEach((layer) => {
        const id = layer.id.toLowerCase();
        const sourceLayer = (layer['source-layer'] || '').toLowerCase();
        const name = id + ' ' + sourceLayer;
        try {
          if (layer.type === 'background') map.setPaintProperty(layer.id, 'background-color', '#F7F5EC');
          else if (layer.type === 'fill' && name.includes('water')) map.setPaintProperty(layer.id, 'fill-color', '#AEE2F4');
          else if (layer.type === 'fill' && /(park|landcover|wood|grass|green)/.test(name)) map.setPaintProperty(layer.id, 'fill-color', '#CFE8BF');
          else if (layer.type === 'fill' && name.includes('building')) map.setPaintProperty(layer.id, 'fill-color', '#E9E9E5');
          else if (layer.type === 'line' && /(road|transport|highway|street)/.test(name)) map.setPaintProperty(layer.id, 'line-color', /(case|outline|border)/.test(name) ? '#D8D8D2' : '#FFFFFF');
          else if (layer.type === 'symbol') {
            map.setPaintProperty(layer.id, 'text-color', /(place|city|town)/.test(name) ? '#303236' : '#7A7D82');
            map.setPaintProperty(layer.id, 'text-halo-color', '#FFFFFF');
            map.setPaintProperty(layer.id, 'text-halo-width', 1.5);
          }
        } catch {}
      });
    });
  </script>
</body>
</html>`;
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#F7F5EC",
    height: 240,
    marginHorizontal: -24,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
});

const iframeStyle = {
  border: 0,
  height: "100%",
  width: "100%",
};
