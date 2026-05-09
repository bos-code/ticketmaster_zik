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
      zoom: 14.1,
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
      height: 34px;
      pointer-events: none;
      position: relative;
      transform: translateX(-3px);
      width: 34px;
    }
    .apple-venue-pin {
      animation: applePinDrop 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
      background: linear-gradient(180deg, #FF5E57 0%, #F4211B 58%, #C70F0A 100%);
      border: 2px solid #FFFFFF;
      border-radius: 50% 50% 50% 0;
      box-shadow: 0 5px 10px rgba(0,0,0,0.24), inset 0 1px 1px rgba(255,255,255,0.42);
      bottom: 0;
      height: 34px;
      left: 0;
      position: relative;
      transform: rotate(-45deg);
      width: 34px;
    }
    .apple-venue-pin-info {
      align-items: center;
      color: #FFFFFF;
      display: flex;
      font: 700 18px/18px -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
      height: 100%;
      justify-content: center;
      transform: rotate(45deg) translateY(-1px);
      width: 100%;
    }
    .apple-venue-label {
      color: #2A2726;
      font: 700 13px/16px -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
      max-width: 180px;
      position: absolute;
      text-shadow: 0 1px 1px #FFFFFF, 1px 0 1px #FFFFFF, -1px 0 1px #FFFFFF, 0 -1px 1px #FFFFFF;
      top: 38px;
      transform: translateX(-24px);
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
        map.setPaintProperty(layer.id, "background-color", "#F8F7F2");
      } else if (layer.type === "fill" && name.includes("water")) {
        map.setPaintProperty(layer.id, "fill-color", "#B8E3F0");
      } else if (
        layer.type === "fill" &&
        /(park|landcover|wood|grass|green)/.test(name)
      ) {
        map.setPaintProperty(layer.id, "fill-color", "#D7EBC7");
      } else if (layer.type === "fill" && name.includes("building")) {
        map.setPaintProperty(layer.id, "fill-color", "#ECEBE6");
      } else if (
        layer.type === "line" &&
        /(road|transport|highway|street)/.test(name)
      ) {
        map.setPaintProperty(
          layer.id,
          "line-color",
          /(case|outline|border)/.test(name) ? "#D4D5D2" : "#FFFDF8",
        );
        map.setPaintProperty(layer.id, "line-opacity", 0.92);
      } else if (layer.type === "line" && name.includes("boundary")) {
        map.setPaintProperty(layer.id, "line-color", "#D7D2CC");
        map.setPaintProperty(layer.id, "line-opacity", 0.28);
      } else if (layer.type === "symbol") {
        map.setPaintProperty(
          layer.id,
          "text-color",
          /(place|city|town)/.test(name) ? "#3F3C39" : "#7F7B76",
        );
        map.setPaintProperty(layer.id, "text-halo-color", "#F8F7F2");
        map.setPaintProperty(layer.id, "text-halo-width", 1.8);
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
    backgroundColor: "#F8F7F2",
    overflow: "hidden",
    position: "relative",
    width: "100%",
  },
  mapAttribution: {
    alignItems: "center",
    bottom: 10,
    flexDirection: "row",
    gap: 7,
    left: 12,
    position: "absolute",
  },
  mapsText: {
    color: "#505050",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0,
  },
  legalText: {
    color: "#555555",
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 0,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#F1F0F4",
    justifyContent: "center",
    paddingVertical: 14,
  },
  buttonText: {
    color: "#242225",
    fontSize: 18,
    fontWeight: "700",
  },
});
