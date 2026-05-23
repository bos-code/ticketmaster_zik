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
      background: #5C2D91;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      height: 24px;
      width: 24px;
    }
    .maplibregl-ctrl-group {
      border-radius: 8px !important;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
    }
    .maplibregl-ctrl-top-right {
      top: 16px !important;
      right: 16px !important;
    }
  </style>
</head>
<body>
  <div id="map"></div>
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

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    }), 'top-right');

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
    flex: 1,
  },
});

const iframeStyle = {
  border: 0,
  height: "100%",
  width: "100%",
};
