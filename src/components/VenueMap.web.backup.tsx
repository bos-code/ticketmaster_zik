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
    html, body, #map { height: 100%; margin: 0; width: 100%; }
    body { background: #F7F5EC; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif; }
    .maplibregl-ctrl-logo, .maplibregl-ctrl-attrib { display: none !important; }
    .pin {
      background: #007AFF;
      border: 3px solid #FFFFFF;
      border-radius: 50% 50% 50% 0;
      box-shadow: 0 8px 18px rgba(0,122,255,0.24);
      height: 28px;
      transform: rotate(-45deg);
      width: 28px;
    }
    .pin::after {
      background: #FFFFFF;
      border-radius: 50%;
      content: "";
      height: 8px;
      left: 7px;
      position: absolute;
      top: 7px;
      width: 8px;
    }
    .label {
      background: rgba(255,255,255,0.94);
      border: 1px solid rgba(0,0,0,0.06);
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.10);
      left: 16px;
      padding: 12px 14px;
      position: absolute;
      right: 16px;
      top: 16px;
      z-index: 2;
    }
    .name { color: #1C1C1E; font-size: 16px; font-weight: 700; line-height: 20px; }
    .address { color: #6C6C70; font-size: 13px; line-height: 17px; margin-top: 2px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="label">
    <div class="name" id="name"></div>
    <div class="address" id="address"></div>
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
    document.getElementById('name').textContent = BOOT.name;
    document.getElementById('address').textContent = BOOT.address;
    map.on('load', () => {
      const el = document.createElement('div');
      el.className = 'pin';
      new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(BOOT.center).addTo(map);
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
    flex: 1,
  },
});

const iframeStyle = {
  border: 0,
  height: "100%",
  width: "100%",
};
