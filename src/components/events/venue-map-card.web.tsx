import { useRouter } from "expo-router";
import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import React, { useEffect, useMemo, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  openExternalMaps,
  toCoordinate,
  type VenueMapData,
} from "@/lib/map-utils";

const FALLBACK_MAP_CENTER = {
  latitude: 6.42674716,
  longitude: 3.43009885,
};

export function VenueMapCard({
  eventId,
  latitude,
  longitude,
  mapHeight = 560,
  venueAddress,
  venueName,
}: VenueMapData & { mapHeight?: number }) {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const venueCoordinate = toCoordinate(latitude, longitude);
  const initialCoordinate = venueCoordinate ?? FALLBACK_MAP_CENTER;
  const mapCenter = useMemo(
    () =>
      [initialCoordinate.longitude, initialCoordinate.latitude] as [
        number,
        number,
      ],
    [initialCoordinate.latitude, initialCoordinate.longitude],
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    ensureAppleMarkerStyles();

    const map = new maplibregl.Map({
      attributionControl: false,
      bearing: 0,
      center: mapCenter,
      container: mapContainerRef.current,
      maxPitch: 45,
      pitch: 0,
      style: "https://tiles.openfreemap.org/styles/bright",
      zoom: 14.65,
    });

    mapRef.current = map;

    map.on("load", () => {
      applyAppleMapsPaint(map);
      markerRef.current = createVenueMarker(venueName)
        .setLngLat(mapCenter)
        .addTo(map);
    });

    return () => {
      markerRef.current?.remove();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [mapCenter, venueName]);

  function handleOpenDirections() {
    if (eventId) {
      router.push({
        pathname: "/event-directions/[id]",
        params: { id: eventId },
      });
      return;
    }

    void handleOpenExternalMaps();
  }

  async function handleOpenExternalMaps() {
    await openExternalMaps({
      destination: {
        latitude: initialCoordinate.latitude,
        longitude: initialCoordinate.longitude,
      },
      destinationLabel: venueName,
      origin: null,
    });
  }

  return (
    <View style={styles.card}>
      <View style={[styles.mapFrame, { height: mapHeight }]}>
        {React.createElement("div", {
          ref: mapContainerRef,
          style: domMapStyle,
        })}
        <View pointerEvents="none" style={styles.mapAttribution}>
          <Text style={styles.mapsText}>Maps</Text>
          <Text style={styles.legalText}>Legal</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={handleOpenDirections}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Get Directions</Text>
      </Pressable>
    </View>
  );
}

function createVenueMarker(venueName: string) {
  const markerWrap = document.createElement("div");
  markerWrap.className = "apple-venue-marker";

  const markerLabel = document.createElement("div");
  markerLabel.className = "apple-venue-label";
  markerLabel.textContent = venueName;

  const markerElement = document.createElement("div");
  markerElement.className = "apple-venue-pin";

  const info = document.createElement("div");
  info.className = "apple-venue-pin-info";
  info.textContent = "i";
  markerElement.appendChild(info);

  markerWrap.appendChild(markerElement);
  markerWrap.appendChild(markerLabel);

  return new maplibregl.Marker({
    anchor: "bottom",
    element: markerWrap,
    offset: [0, 2],
  });
}

function ensureAppleMarkerStyles() {
  if (document.getElementById("apple-marker-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "apple-marker-styles";
  style.textContent = `
    .apple-venue-marker {
      height: 42px;
      pointer-events: none;
      position: relative;
      width: 120px;
    }
    .apple-venue-pin {
      animation: applePinDrop 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
      background: linear-gradient(180deg, #FF5E57 0%, #F4211B 58%, #C70F0A 100%);
      border: 2px solid #FFFFFF;
      border-radius: 50% 50% 50% 0;
      box-shadow: 0 4px 8px rgba(0,0,0,0.28), inset 0 1px 1px rgba(255,255,255,0.48);
      height: 32px;
      left: 44px;
      position: absolute;
      top: 0;
      transform: rotate(-45deg);
      width: 32px;
    }
    .apple-venue-pin-info {
      align-items: center;
      color: #FFFFFF;
      display: flex;
      font: 700 17px/17px -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
      height: 100%;
      justify-content: center;
      transform: rotate(45deg) translateY(-1px);
      width: 100%;
    }
    .apple-venue-label {
      color: #2D2928;
      font: 700 12px/15px -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
      left: 50%;
      max-width: 190px;
      position: absolute;
      text-align: center;
      text-shadow: 0 1px 1px #FFFFFF, 1px 0 1px #FFFFFF, -1px 0 1px #FFFFFF, 0 -1px 1px #FFFFFF, 0 0 2px #FFFFFF;
      top: 35px;
      transform: translateX(-50%);
      white-space: nowrap;
    }
    @keyframes applePinDrop {
      0% { transform: rotate(-45deg) scale(0); }
      72% { transform: rotate(-45deg) scale(1.1); }
      100% { transform: rotate(-45deg) scale(1); }
    }
  `;
  document.head.appendChild(style);
}

function applyAppleMapsPaint(map: MapLibreMap) {
  const loadedStyle = map.getStyle();

  (loadedStyle.layers || []).forEach((layer) => {
    const sourceLayer = String(
      (layer as { "source-layer"?: string })["source-layer"] || "",
    ).toLowerCase();
    const id = layer.id.toLowerCase();
    const name = `${id} ${sourceLayer}`;

    try {
      if (layer.type === "background") {
        map.setPaintProperty(layer.id, "background-color", "#F6F5F1");
      } else if (layer.type === "fill" && name.includes("water")) {
        map.setPaintProperty(layer.id, "fill-color", "#B7DDEA");
      } else if (
        layer.type === "fill" &&
        /(park|landcover|wood|grass|green)/.test(name)
      ) {
        map.setPaintProperty(layer.id, "fill-color", "#DCECC9");
      } else if (layer.type === "fill" && name.includes("building")) {
        map.setPaintProperty(layer.id, "fill-color", "#EAE8E2");
      } else if (
        layer.type === "line" &&
        /(road|transport|highway|street)/.test(name)
      ) {
        map.setPaintProperty(
          layer.id,
          "line-color",
          /(case|outline|border)/.test(name) ? "#D1D2CF" : "#FFFCF7",
        );
        map.setPaintProperty(layer.id, "line-opacity", 0.96);
      } else if (layer.type === "line" && name.includes("boundary")) {
        map.setPaintProperty(layer.id, "line-color", "#D4D0CA");
        map.setPaintProperty(layer.id, "line-opacity", 0.32);
      } else if (layer.type === "symbol") {
        map.setPaintProperty(
          layer.id,
          "text-color",
          /(place|city|town)/.test(name) ? "#4D4742" : "#827E79",
        );
        map.setPaintProperty(layer.id, "text-halo-color", "#F6F5F1");
        map.setPaintProperty(layer.id, "text-halo-width", 1.9);
      }
    } catch {
      // Some third-party style layers do not expose every paint property.
    }
  });
}

const domMapStyle: React.CSSProperties = {
  bottom: 0,
  left: 0,
  position: "absolute",
  right: 0,
  top: 0,
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  mapFrame: {
    backgroundColor: "#F6F5F1",
    overflow: "hidden",
    position: "relative",
    width: "100%",
  },
  mapAttribution: {
    alignItems: "center",
    bottom: 9,
    flexDirection: "row",
    gap: 6,
    left: 14,
    position: "absolute",
  },
  mapsText: {
    color: "#4B4B4B",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0,
  },
  legalText: {
    color: "#4F4F4F",
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 0,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#F2F1F5",
    justifyContent: "center",
    minHeight: 66,
    paddingVertical: 0,
  },
  buttonText: {
    color: "#272529",
    fontSize: 17,
    fontWeight: "700",
  },
});
