import { useRouter } from "expo-router";
import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import {
  openExternalMaps,
  toCoordinate,
  type VenueMapData,
} from "@/lib/map-utils";

const FALLBACK_MAP_CENTER = {
  latitude: 6.42674716,
  longitude: 3.43009885,
};

type SearchResult = {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
};

export function VenueMapCard({
  eventId,
  latitude,
  longitude,
  venueAddress,
  venueName,
}: VenueMapData) {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const venueCoordinate = toCoordinate(latitude, longitude);
  const initialCoordinate = venueCoordinate ?? FALLBACK_MAP_CENTER;
  const [query, setQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState({
    address: venueAddress || venueName,
    latitude: initialCoordinate.latitude,
    longitude: initialCoordinate.longitude,
    name: venueName,
    verified: Boolean(venueCoordinate),
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const mapCenter = useMemo(
    () => [initialCoordinate.longitude, initialCoordinate.latitude] as [number, number],
    [initialCoordinate.latitude, initialCoordinate.longitude],
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

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
    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: false }), "top-right");

    map.on("load", () => {
      applyAppleMapsPaint(map);
      markerRef.current = createVenueMarker()
        .setLngLat(mapCenter)
        .addTo(map);
    });

    map.on("contextmenu", (event) => {
      selectCoordinate(event.lngLat.lng, event.lngLat.lat, "Dropped Pin", false);
    });

    return () => {
      markerRef.current?.remove();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [mapCenter]);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({
        addressdetails: "1",
        format: "jsonv2",
        limit: "5",
        q: query.trim(),
      });

      fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        signal: controller.signal,
      })
        .then((response) => (response.ok ? response.json() : []))
        .then((payload) => {
          if (Array.isArray(payload)) {
            setResults(payload as SearchResult[]);
          }
        })
        .catch(() => {});
    }, 220);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function selectCoordinate(
    longitudeValue: number,
    latitudeValue: number,
    name: string,
    verified: boolean,
    address = name,
  ) {
    setSelectedPlace({
      address,
      latitude: latitudeValue,
      longitude: longitudeValue,
      name,
      verified,
    });

    markerRef.current?.setLngLat([longitudeValue, latitudeValue]);
    mapRef.current?.flyTo({
      center: [longitudeValue, latitudeValue],
      duration: 800,
      easing: (t) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      pitch: 34,
      zoom: 16.2,
    });
  }

  function handleSelectResult(result: SearchResult) {
    const nextLatitude = Number(result.lat);
    const nextLongitude = Number(result.lon);

    if (!Number.isFinite(nextLatitude) || !Number.isFinite(nextLongitude)) {
      return;
    }

    setQuery("");
    setResults([]);
    selectCoordinate(
      nextLongitude,
      nextLatitude,
      result.display_name.split(",")[0] || venueName,
      true,
      result.display_name,
    );
  }

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
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
      },
      destinationLabel: selectedPlace.name,
      origin: null,
    });
  }

  return (
    <View style={styles.card}>
      <View style={styles.mapFrame}>
        {React.createElement("div", {
          ref: mapContainerRef,
          style: domMapStyle,
        })}

        <View style={styles.searchWrap}>
          <TextInput
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor="#8E8E93"
            style={styles.searchInput}
            value={query}
          />

          {results.length ? (
            <View style={styles.resultsSheet}>
              {results.map((result) => (
                <Pressable
                  accessibilityRole="button"
                  key={result.place_id}
                  onPress={() => handleSelectResult(result)}
                  style={styles.resultRow}
                >
                  <Text numberOfLines={1} style={styles.resultTitle}>
                    {result.display_name.split(",")[0]}
                  </Text>
                  <Text numberOfLines={1} style={styles.resultAddress}>
                    {result.display_name}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text numberOfLines={1} style={styles.placeName}>
            {selectedPlace.name}
          </Text>
          <Text numberOfLines={2} style={styles.placeAddress}>
            {selectedPlace.address}
          </Text>
          <Text style={styles.verifiedText}>
            {selectedPlace.verified
              ? "Verified map result"
              : "Right-click the map or search to verify this place"}
          </Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <Pressable
          accessibilityRole="button"
          onPress={handleOpenDirections}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Get Directions</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={handleOpenExternalMaps}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Open in Maps</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createVenueMarker() {
  const markerElement = document.createElement("div");
  markerElement.style.background = "#007AFF";
  markerElement.style.border = "3px solid #FFFFFF";
  markerElement.style.borderRadius = "50% 50% 50% 0";
  markerElement.style.boxShadow = "0 8px 18px rgba(0,122,255,0.24)";
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

function applyAppleMapsPaint(map: MapLibreMap) {
  const loadedStyle = map.getStyle();

  (loadedStyle.layers || []).forEach((layer) => {
    const sourceLayer = String(layer["source-layer"] || "").toLowerCase();
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
    height: 560,
    overflow: "hidden",
    position: "relative",
    width: "100%",
  },
  searchWrap: {
    left: 16,
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 4,
  },
  searchInput: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderColor: "rgba(0,0,0,0.06)",
    borderRadius: 16,
    borderWidth: 1,
    boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
    color: "#1C1C1E",
    fontSize: 17,
    height: 52,
    outlineStyle: "none",
    paddingHorizontal: 16,
  },
  resultsSheet: {
    backgroundColor: "rgba(255,255,255,0.97)",
    borderColor: "rgba(0,0,0,0.06)",
    borderRadius: 18,
    borderWidth: 1,
    boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
    marginTop: 8,
    overflow: "hidden",
  },
  resultRow: {
    borderBottomColor: "#E5E5EA",
    borderBottomWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  resultTitle: {
    color: "#1C1C1E",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 19,
  },
  resultAddress: {
    color: "#6C6C70",
    fontSize: 13,
    lineHeight: 17,
    marginTop: 2,
  },
  sheet: {
    backgroundColor: "rgba(255,255,255,0.97)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    bottom: 0,
    boxShadow: "0 -4px 30px rgba(0,0,0,0.10)",
    left: 0,
    paddingBottom: 18,
    paddingHorizontal: 18,
    paddingTop: 10,
    position: "absolute",
    right: 0,
    zIndex: 3,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: "#C7C7CC",
    borderRadius: 3,
    height: 5,
    marginBottom: 14,
    width: 36,
  },
  placeName: {
    color: "#1C1C1E",
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 25,
  },
  placeAddress: {
    color: "#6C6C70",
    fontSize: 15,
    lineHeight: 20,
    marginTop: 4,
  },
  verifiedText: {
    color: "#7A7D82",
    fontSize: 12,
    lineHeight: 16,
    marginTop: 10,
  },
  buttonRow: {
    backgroundColor: "#F2F2F7",
    flexDirection: "row",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#007AFF",
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    borderLeftColor: "#E5E5EA",
    borderLeftWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  secondaryButtonText: {
    color: "#1C1C1E",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
  },
});
