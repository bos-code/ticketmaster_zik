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
      pitch: 24,
      style: "https://tiles.openfreemap.org/styles/bright",
      zoom: 15.5,
    });

    mapRef.current = map;
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: true, showZoom: false }),
      "top-right",
    );

    map.on("load", () => {
      applyAppleMapsPaint(map);
      markerRef.current = createVenueMarker().setLngLat(mapCenter).addTo(map);
    });

    return () => {
      markerRef.current?.remove();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [mapCenter]);

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

function createVenueMarker() {
  const markerElement = document.createElement("div");
  markerElement.style.animation =
    "applePinDrop 300ms cubic-bezier(0.34, 1.56, 0.64, 1)";
  markerElement.style.background = "#FF3B30";
  markerElement.style.border = "3px solid #FFFFFF";
  markerElement.style.borderRadius = "50% 50% 50% 0";
  markerElement.style.boxShadow = "0 8px 18px rgba(255,59,48,0.24)";
  markerElement.style.height = "28px";
  markerElement.style.transform = "rotate(-45deg)";
  markerElement.style.width = "28px";

  const dot = document.createElement("div");
  dot.style.background = "#FFFFFF";
  dot.style.borderRadius = "50%";
  dot.style.height = "8px";
  dot.style.left = "7px";
  dot.style.position = "absolute";
  dot.style.top = "7px";
  dot.style.width = "8px";
  markerElement.appendChild(dot);

  return new maplibregl.Marker({
    anchor: "bottom",
    element: markerElement,
  });
}

function ensureAppleMarkerStyles() {
  if (document.getElementById("apple-marker-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "apple-marker-styles";
  style.textContent = `
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
        map.setPaintProperty(layer.id, "background-color", "#F7F5EC");
      } else if (layer.type === "fill" && name.includes("water")) {
        map.setPaintProperty(layer.id, "fill-color", "#AEE2F4");
      } else if (
        layer.type === "fill" &&
        /(park|landcover|wood|grass|green)/.test(name)
      ) {
        map.setPaintProperty(layer.id, "fill-color", "#CFE8BF");
      } else if (layer.type === "fill" && name.includes("building")) {
        map.setPaintProperty(layer.id, "fill-color", "#E9E9E5");
      } else if (
        layer.type === "line" &&
        /(road|transport|highway|street)/.test(name)
      ) {
        map.setPaintProperty(
          layer.id,
          "line-color",
          /(case|outline|border)/.test(name) ? "#D8D8D2" : "#FFFFFF",
        );
      } else if (layer.type === "line" && name.includes("boundary")) {
        map.setPaintProperty(layer.id, "line-color", "#D0CECA");
        map.setPaintProperty(layer.id, "line-opacity", 0.35);
      } else if (layer.type === "symbol") {
        map.setPaintProperty(
          layer.id,
          "text-color",
          /(place|city|town)/.test(name) ? "#303236" : "#7A7D82",
        );
        map.setPaintProperty(layer.id, "text-halo-color", "#FFFFFF");
        map.setPaintProperty(layer.id, "text-halo-width", 1.5);
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
    backgroundColor: "#F7F5EC",
    overflow: "hidden",
    position: "relative",
    width: "100%",
  },
  button: {
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    paddingVertical: 12,
  },
  buttonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "500",
  },
});
