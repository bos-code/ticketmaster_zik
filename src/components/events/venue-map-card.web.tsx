import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  buildStaticMapPreviewUrl,
  openExternalMaps,
  toCoordinate,
  type VenueMapData,
} from "@/lib/map-utils";

const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

const FALLBACK_MAP_CENTER = {
  latitude: 6.42674716,
  longitude: 3.43009885,
};

export function VenueMapCard({
  eventId,
  latitude,
  longitude,
  venueAddress,
  venueName,
}: VenueMapData) {
  const router = useRouter();
  const venueCoordinate = toCoordinate(latitude, longitude);
  const initialCoordinate = venueCoordinate ?? FALLBACK_MAP_CENTER;
  const html = useMemo(
    () =>
      buildWebAppleMapsHtml({
        apiKey: GOOGLE_PLACES_API_KEY,
        latitude: initialCoordinate.latitude,
        longitude: initialCoordinate.longitude,
        shouldResolveInitialAddress: !venueCoordinate,
        venueAddress,
        venueName,
      }),
    [
      initialCoordinate.latitude,
      initialCoordinate.longitude,
      venueAddress,
      venueCoordinate,
      venueName,
    ],
  );
  const staticMapUrl = buildStaticMapPreviewUrl(
    initialCoordinate.longitude,
    initialCoordinate.latitude,
  );

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
    if (!venueCoordinate) {
      return;
    }

    await openExternalMaps({
      destination: venueCoordinate,
      destinationLabel: venueName,
      origin: null,
    });
  }

  return (
    <View style={styles.card}>
      <View style={styles.mapFrame}>
        {React.createElement("iframe", {
          allow: "geolocation",
          referrerPolicy: "no-referrer-when-downgrade",
          srcDoc: html,
          style: iframeStyle,
          title: `${venueName} map`,
        })}
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
          disabled={!venueCoordinate}
          onPress={handleOpenExternalMaps}
          style={[styles.secondaryButton, !venueCoordinate && styles.buttonDisabled]}
        >
          <Text style={styles.secondaryButtonText}>Open in Maps</Text>
        </Pressable>
      </View>

      {!GOOGLE_PLACES_API_KEY ? (
        <ImageFallbackNotice staticMapUrl={staticMapUrl} />
      ) : null}
    </View>
  );
}

function ImageFallbackNotice({ staticMapUrl }: { staticMapUrl: string }) {
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeText}>
        Places search needs EXPO_PUBLIC_GOOGLE_MAPS_API_KEY. The vector map still loads from
        OpenFreeMap.
      </Text>
      <Text selectable style={styles.noticeLink}>
        {staticMapUrl}
      </Text>
    </View>
  );
}

function buildWebAppleMapsHtml({
  apiKey,
  latitude,
  longitude,
  shouldResolveInitialAddress,
  venueAddress,
  venueName,
}: {
  apiKey: string;
  latitude: number;
  longitude: number;
  shouldResolveInitialAddress: boolean;
  venueAddress?: string;
  venueName: string;
}) {
  const boot = JSON.stringify({
    apiKey,
    center: [longitude, latitude],
    place: {
      address: venueAddress || venueName,
      lat: latitude,
      lng: longitude,
      name: venueName,
      placeId: "",
      verified: false,
    },
    shouldResolveInitialAddress,
  }).replace(/</g, "\\u003c");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; }
    html, body, #map { height: 100%; margin: 0; width: 100%; }
    body {
      background: #F7F5EC;
      color: #303236;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui, sans-serif;
      overflow: hidden;
    }
    #map { position: absolute; inset: 0; }
    .maplibregl-ctrl-logo, .maplibregl-ctrl-attrib { display: none !important; }
    .search-shell { left: 16px; position: absolute; right: 16px; top: 16px; z-index: 8; }
    .search-bar {
      align-items: center;
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(0,0,0,0.06);
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.10);
      display: flex;
      height: 52px;
      padding: 0 16px;
    }
    .search-icon { color: #8E8E93; font-size: 20px; margin-right: 10px; }
    #searchInput {
      background: transparent;
      border: 0;
      color: #1C1C1E;
      flex: 1;
      font: 400 17px/22px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui, sans-serif;
      min-width: 0;
      outline: 0;
    }
    #searchInput::placeholder { color: #8E8E93; }
    .suggestions {
      background: rgba(255,255,255,0.97);
      backdrop-filter: blur(30px);
      -webkit-backdrop-filter: blur(30px);
      border: 1px solid rgba(0,0,0,0.06);
      border-radius: 18px;
      box-shadow: 0 6px 24px rgba(0,0,0,0.12);
      margin-top: 8px;
      max-height: 260px;
      opacity: 0;
      overflow: hidden;
      pointer-events: none;
      transform: translateY(-8px);
      transition: opacity 180ms ease, transform 180ms ease;
    }
    .suggestions.open { opacity: 1; pointer-events: auto; transform: translateY(0); }
    .suggestion {
      align-items: center;
      background: transparent;
      border: 0;
      border-bottom: 1px solid #E5E5EA;
      display: flex;
      gap: 12px;
      min-height: 62px;
      padding: 10px 14px;
      text-align: left;
      width: 100%;
    }
    .suggestion:last-child { border-bottom: 0; }
    .suggestion-icon {
      align-items: center;
      background: #F2F2F7;
      border-radius: 16px;
      color: #007AFF;
      display: flex;
      height: 32px;
      justify-content: center;
      width: 32px;
    }
    .suggestion-main { flex: 1; min-width: 0; }
    .suggestion-title { color: #1C1C1E; display: block; font-size: 15px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .suggestion-address { color: #6C6C70; display: block; font-size: 13px; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .control-stack {
      display: flex;
      flex-direction: column;
      gap: 10px;
      position: absolute;
      right: 16px;
      top: 86px;
      z-index: 7;
    }
    .glass-button {
      align-items: center;
      background: rgba(255,255,255,0.86);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border: 1px solid rgba(255,255,255,0.65);
      border-radius: 50%;
      box-shadow: 0 4px 16px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.08);
      color: #303236;
      display: flex;
      height: 44px;
      justify-content: center;
      padding: 0;
      width: 44px;
    }
    .tracking svg { fill: #007AFF; stroke: #007AFF; }
    #compass { opacity: 0; pointer-events: none; position: absolute; right: 16px; top: 188px; transition: opacity 180ms ease; z-index: 7; }
    #compass.visible { opacity: 1; pointer-events: auto; }
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
    .pin.drop { animation: pinDrop 300ms cubic-bezier(0.34, 1.56, 0.64, 1); }
    .user-wrap {
      align-items: center;
      background: rgba(0,122,255,0.16);
      border-radius: 50%;
      display: flex;
      height: 76px;
      justify-content: center;
      width: 76px;
    }
    .user-dot {
      animation: userPulse 1300ms cubic-bezier(0.34, 1.56, 0.64, 1) 1;
      background: #007AFF;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,122,255,0.4);
      height: 20px;
      width: 20px;
    }
    .poi-marker {
      align-items: center;
      background: #FFFFFF;
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 50%;
      color: var(--marker-color);
      display: flex;
      font-size: 17px;
      height: 32px;
      justify-content: center;
      transition: transform 160ms ease;
      width: 32px;
    }
    .poi-marker.active { transform: scale(1.2); }
    .bottom-sheet {
      background: rgba(255,255,255,0.97);
      backdrop-filter: blur(30px);
      -webkit-backdrop-filter: blur(30px);
      border-radius: 24px 24px 0 0;
      bottom: 0;
      box-shadow: 0 -4px 30px rgba(0,0,0,0.10);
      left: 0;
      min-height: 250px;
      padding: 10px 18px 18px;
      position: absolute;
      right: 0;
      transform: translateY(calc(100% - 28px));
      transition: transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1);
      z-index: 9;
    }
    .bottom-sheet.half { transform: translateY(44%); }
    .bottom-sheet.full { transform: translateY(8%); }
    .handle { background: #C7C7CC; border-radius: 3px; height: 5px; margin: 0 auto 18px; width: 36px; }
    .place-name { color: #1C1C1E; font-size: 20px; font-weight: 600; line-height: 25px; margin: 0; }
    .place-address { color: #6C6C70; font-size: 15px; line-height: 20px; margin: 4px 0 16px; }
    .divider { background: #E5E5EA; height: 1px; margin-bottom: 14px; }
    .action-row { display: grid; gap: 9px; grid-template-columns: repeat(4, 1fr); margin-bottom: 16px; }
    .action {
      align-items: center;
      background: #F2F2F7;
      border: 0;
      border-radius: 14px;
      color: #007AFF;
      display: flex;
      flex-direction: column;
      font: 600 11px/14px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui, sans-serif;
      gap: 5px;
      height: 66px;
      justify-content: center;
    }
    #confirmButton {
      background: #007AFF;
      border: 0;
      border-radius: 14px;
      color: #FFFFFF;
      font: 700 16px/20px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui, sans-serif;
      height: 50px;
      width: 100%;
    }
    #confirmButton:disabled { background: #A8C8F8; color: rgba(255,255,255,0.76); }
    .status { color: #7A7D82; font-size: 12px; margin-top: 10px; text-align: center; }
    @keyframes userPulse { 0% { transform: scale(0.72); } 70% { transform: scale(1.14); } 100% { transform: scale(1); } }
    @keyframes pinDrop { 0% { transform: rotate(-45deg) scale(0); } 72% { transform: rotate(-45deg) scale(1.1); } 100% { transform: rotate(-45deg) scale(1); } }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="search-shell">
    <label class="search-bar">
      <span class="search-icon">&#8981;</span>
      <input id="searchInput" autocomplete="off" placeholder="Search" />
    </label>
    <div id="suggestions" class="suggestions"></div>
  </div>
  <div class="control-stack">
    <button class="glass-button" id="layersButton" aria-label="Map mode">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="22" height="22"><path d="M12 3 3.8 7.4 12 11.8l8.2-4.4L12 3Z"/><path d="m3.8 12.2 8.2 4.4 8.2-4.4"/><path d="m3.8 16.8 8.2 4.4 8.2-4.4"/></svg>
    </button>
    <button class="glass-button" id="locationButton" aria-label="Current location">
      <svg viewBox="0 0 24 24" fill="none" stroke="#007AFF" stroke-width="2" width="22" height="22"><path d="M12 3.7 19.7 20 12 16.5 4.3 20 12 3.7Z"/></svg>
    </button>
  </div>
  <button class="glass-button" id="compass" aria-label="Compass">
    <svg viewBox="0 0 24 24" fill="none" stroke="#303236" stroke-width="1.8" width="22" height="22"><path d="M12 3 16 12 12 21 8 12 12 3Z"/><path d="M12 3v9"/></svg>
  </button>
  <section id="sheet" class="bottom-sheet" aria-live="polite">
    <div class="handle" id="sheetHandle"></div>
    <h2 class="place-name" id="placeName">Select a place</h2>
    <p class="place-address" id="placeAddress">Search for a verified address or long-press the map.</p>
    <div class="divider"></div>
    <div class="action-row">
      <button class="action" id="directionsButton">Directions</button>
      <button class="action">Call</button>
      <button class="action">Website</button>
      <button class="action">Share</button>
    </div>
    <button id="confirmButton" disabled>Select Verified Address</button>
    <div class="status" id="statusText">Waiting for Places confirmation</div>
  </section>
  <script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
  <script src="https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places"></script>
  <script>
    const BOOT = ${boot};
    const style = {
      version: 8,
      glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
      sources: { openfreemap: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' } },
      layers: [
        { id: 'background', type: 'background', paint: { 'background-color': '#F7F5EC' } },
        { id: 'water', type: 'fill', source: 'openfreemap', 'source-layer': 'water', paint: { 'fill-color': '#AEE2F4' } },
        { id: 'parks', type: 'fill', source: 'openfreemap', 'source-layer': 'park', paint: { 'fill-color': '#CFE8BF', 'fill-opacity': 0.92 } },
        { id: 'landuse-green', type: 'fill', source: 'openfreemap', 'source-layer': 'landcover', filter: ['in', ['get', 'class'], ['literal', ['grass', 'wood', 'park']]], paint: { 'fill-color': '#CFE8BF', 'fill-opacity': 0.72 } },
        { id: 'buildings', type: 'fill', source: 'openfreemap', 'source-layer': 'building', minzoom: 13, paint: { 'fill-color': '#E9E9E5', 'fill-opacity': 0.92 } },
        { id: 'building-extrusion', type: 'fill-extrusion', source: 'openfreemap', 'source-layer': 'building', minzoom: 15, paint: { 'fill-extrusion-color': '#E9E9E5', 'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 15, 2, 17, 18], 'fill-extrusion-base': 0, 'fill-extrusion-opacity': 0.44 } },
        { id: 'boundary', type: 'line', source: 'openfreemap', 'source-layer': 'boundary', paint: { 'line-color': '#D0CECA', 'line-width': 0.5, 'line-opacity': 0.35 } },
        { id: 'roads-casing', type: 'line', source: 'openfreemap', 'source-layer': 'transportation', paint: { 'line-color': '#D8D8D2', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1.4, 14, 4.6, 17, 10], 'line-opacity': 0.82 }, layout: { 'line-cap': 'round', 'line-join': 'round' } },
        { id: 'roads', type: 'line', source: 'openfreemap', 'source-layer': 'transportation', paint: { 'line-color': '#FFFFFF', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.9, 14, 3.4, 17, 8] }, layout: { 'line-cap': 'round', 'line-join': 'round' } },
        { id: 'poi-labels', type: 'symbol', source: 'openfreemap', 'source-layer': 'poi', minzoom: 15, layout: { 'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']], 'text-font': ['Noto Sans Regular'], 'text-size': 11, 'text-padding': 8 }, paint: { 'text-color': '#7A7D82', 'text-halo-color': '#FFFFFF', 'text-halo-width': 1.5 } },
        { id: 'road-labels', type: 'symbol', source: 'openfreemap', 'source-layer': 'transportation_name', minzoom: 13, layout: { 'symbol-placement': 'line', 'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']], 'text-font': ['Noto Sans Regular'], 'text-size': ['interpolate', ['linear'], ['zoom'], 13, 10, 17, 12] }, paint: { 'text-color': '#7A7D82', 'text-halo-color': '#FFFFFF', 'text-halo-width': 1.5 } },
        { id: 'place-labels', type: 'symbol', source: 'openfreemap', 'source-layer': 'place', layout: { 'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']], 'text-font': ['Noto Sans Medium'], 'text-size': ['interpolate', ['linear'], ['zoom'], 5, 15, 12, 20], 'text-padding': 16 }, paint: { 'text-color': '#303236', 'text-halo-color': '#FFFFFF', 'text-halo-width': 1.5 } }
      ]
    };
    const map = new maplibregl.Map({
      attributionControl: false,
      bearing: 0,
      center: BOOT.center,
      container: 'map',
      maxPitch: 45,
      pitch: 24,
      style: 'https://tiles.openfreemap.org/styles/bright',
      zoom: 15.4
    });
    const sheet = document.getElementById('sheet');
    const placeName = document.getElementById('placeName');
    const placeAddress = document.getElementById('placeAddress');
    const confirmButton = document.getElementById('confirmButton');
    const statusText = document.getElementById('statusText');
    const suggestions = document.getElementById('suggestions');
    const input = document.getElementById('searchInput');
    const compass = document.getElementById('compass');
    const locationButton = document.getElementById('locationButton');
    let marker, userMarker, userPosition, selectedPlace, autocomplete, places, geocoder, directionsService;
    function setSheet(snap) {
      sheet.classList.toggle('half', snap === 'half');
      sheet.classList.toggle('full', snap === 'full');
    }
    function markerEl() {
      const el = document.createElement('div');
      el.className = 'pin drop';
      return el;
    }
    function setPin(lng, lat) {
      if (!marker) {
        marker = new maplibregl.Marker({ element: markerEl(), draggable: true, anchor: 'bottom' }).setLngLat([lng, lat]).addTo(map);
        marker.on('dragend', () => {
          const ll = marker.getLngLat();
          reverseGeocode(ll.lng, ll.lat);
        });
      } else {
        marker.setLngLat([lng, lat]);
        marker.getElement().classList.remove('drop');
        void marker.getElement().offsetWidth;
        marker.getElement().classList.add('drop');
      }
    }
    function updateSelectedPlace(place) {
      selectedPlace = place;
      placeName.textContent = place.name || 'Selected place';
      placeAddress.textContent = place.address || '';
      confirmButton.disabled = !place.verified || !place.placeId;
      statusText.textContent = place.verified ? 'Verified by Places' : 'Move the pin or choose a Places result to verify';
      setPin(place.lng, place.lat);
      setSheet('half');
    }
    function flyTo(lng, lat) {
      map.flyTo({
        center: [lng, lat],
        duration: 800,
        easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
        pitch: 34,
        zoom: 16.2
      });
    }
    function initGoogle() {
      if (!window.google || !google.maps || !BOOT.apiKey) {
        statusText.textContent = 'Add a Google Places key to verify addresses';
        return;
      }
      autocomplete = new google.maps.places.AutocompleteService();
      places = new google.maps.places.PlacesService(document.createElement('div'));
      geocoder = new google.maps.Geocoder();
      directionsService = new google.maps.DirectionsService();
      if (BOOT.shouldResolveInitialAddress && BOOT.place.address) {
        geocoder.geocode({ address: BOOT.place.address }, (results, status) => {
          const result = status === 'OK' && results && results[0] ? results[0] : null;
          if (!result || !result.geometry) {
            reverseGeocode(BOOT.center[0], BOOT.center[1], false);
            return;
          }
          const lat = result.geometry.location.lat();
          const lng = result.geometry.location.lng();
          updateSelectedPlace({ address: result.formatted_address, lat, lng, name: BOOT.place.name, placeId: result.place_id, verified: Boolean(result.place_id) });
          flyTo(lng, lat);
        });
        return;
      }
      reverseGeocode(BOOT.center[0], BOOT.center[1], false);
    }
    function showPredictions(predictions) {
      suggestions.innerHTML = '';
      predictions.forEach((prediction) => {
        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'suggestion';
        row.innerHTML = '<span class="suggestion-icon">&#8981;</span><span class="suggestion-main"><span class="suggestion-title"></span><span class="suggestion-address"></span></span>';
        row.querySelector('.suggestion-title').textContent = prediction.structured_formatting.main_text;
        row.querySelector('.suggestion-address').textContent = prediction.structured_formatting.secondary_text || prediction.description;
        row.addEventListener('click', () => selectPrediction(prediction.place_id));
        suggestions.appendChild(row);
      });
      suggestions.classList.toggle('open', predictions.length > 0);
    }
    function selectPrediction(placeId) {
      suggestions.classList.remove('open');
      places.getDetails({ fields: ['name', 'formatted_address', 'geometry', 'place_id'], placeId }, (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place || !place.geometry) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        input.value = place.name || place.formatted_address || '';
        updateSelectedPlace({ address: place.formatted_address, lat, lng, name: place.name, placeId: place.place_id, verified: true });
        flyTo(lng, lat);
        buildRoute();
      });
    }
    function reverseGeocode(lng, lat, animate = true) {
      setPin(lng, lat);
      if (animate) flyTo(lng, lat);
      if (!geocoder) {
        updateSelectedPlace({ address: lng.toFixed(5) + ', ' + lat.toFixed(5), lat, lng, name: BOOT.place.name, placeId: '', verified: false });
        return;
      }
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        const result = status === 'OK' && results && results[0] ? results[0] : null;
        updateSelectedPlace({
          address: result ? result.formatted_address : 'No verified address found',
          lat,
          lng,
          name: result ? ((result.address_components[0] && result.address_components[0].long_name) || BOOT.place.name) : BOOT.place.name,
          placeId: result ? result.place_id : '',
          verified: Boolean(result && result.place_id)
        });
      });
    }
    function buildRoute() {
      if (!directionsService || !userPosition || !selectedPlace) return;
      directionsService.route({
        origin: { lat: userPosition.lat, lng: userPosition.lng },
        destination: { lat: selectedPlace.lat, lng: selectedPlace.lng },
        provideRouteAlternatives: true,
        travelMode: google.maps.TravelMode.DRIVING
      }, (response, status) => {
        if (status !== 'OK' || !response || !response.routes) return;
        const features = response.routes.map((route, index) => ({
          type: 'Feature',
          properties: { selected: index === 0 },
          geometry: { type: 'LineString', coordinates: route.overview_path.map((p) => [p.lng(), p.lat()]) }
        }));
        const data = { type: 'FeatureCollection', features };
        if (map.getSource('routes')) map.getSource('routes').setData(data);
        else {
          map.addSource('routes', { type: 'geojson', data });
          map.addLayer({ id: 'route-alt', type: 'line', source: 'routes', filter: ['!', ['get', 'selected']], paint: { 'line-color': '#A8C8F8', 'line-width': 4 }, layout: { 'line-cap': 'round', 'line-join': 'round' } });
          map.addLayer({ id: 'route-main-shadow', type: 'line', source: 'routes', filter: ['get', 'selected'], paint: { 'line-color': 'rgba(0,0,0,0.12)', 'line-width': 9, 'line-blur': 3 }, layout: { 'line-cap': 'round', 'line-join': 'round' } });
          map.addLayer({ id: 'route-main', type: 'line', source: 'routes', filter: ['get', 'selected'], paint: { 'line-color': '#007AFF', 'line-width': 6 }, layout: { 'line-cap': 'round', 'line-join': 'round' } });
        }
      });
    }
    input.addEventListener('input', () => {
      const value = input.value.trim();
      selectedPlace = null;
      confirmButton.disabled = true;
      if (!autocomplete || value.length < 2) {
        suggestions.classList.remove('open');
        return;
      }
      autocomplete.getPlacePredictions({ input: value }, (predictions) => showPredictions(predictions || []));
    });
    function applyAppleMapPaint() {
      const loadedStyle = map.getStyle();
      (loadedStyle.layers || []).forEach((layer) => {
        const sourceLayer = (layer['source-layer'] || '').toLowerCase();
        const id = layer.id.toLowerCase();
        const name = id + ' ' + sourceLayer;
        try {
          if (layer.type === 'background') {
            map.setPaintProperty(layer.id, 'background-color', '#F7F5EC');
          } else if (layer.type === 'fill' && name.includes('water')) {
            map.setPaintProperty(layer.id, 'fill-color', '#AEE2F4');
            map.setPaintProperty(layer.id, 'fill-outline-color', '#AEE2F4');
          } else if (layer.type === 'fill' && /(park|landcover|wood|grass|green)/.test(name)) {
            map.setPaintProperty(layer.id, 'fill-color', '#CFE8BF');
            map.setPaintProperty(layer.id, 'fill-opacity', 0.9);
          } else if (layer.type === 'fill' && name.includes('building')) {
            map.setPaintProperty(layer.id, 'fill-color', '#E9E9E5');
            map.setPaintProperty(layer.id, 'fill-opacity', 0.92);
          } else if (layer.type === 'line' && /(road|transport|highway|street)/.test(name)) {
            map.setPaintProperty(layer.id, 'line-color', /(case|outline|border)/.test(name) ? '#D8D8D2' : '#FFFFFF');
          } else if (layer.type === 'line' && name.includes('boundary')) {
            map.setPaintProperty(layer.id, 'line-color', '#D0CECA');
            map.setPaintProperty(layer.id, 'line-opacity', 0.35);
          } else if (layer.type === 'symbol') {
            map.setPaintProperty(layer.id, 'text-color', /(place|city|town)/.test(name) ? '#303236' : '#7A7D82');
            map.setPaintProperty(layer.id, 'text-halo-color', '#FFFFFF');
            map.setPaintProperty(layer.id, 'text-halo-width', 1.5);
          }
        } catch {}
      });
    }
    map.on('load', () => {
      applyAppleMapPaint();
      setPin(BOOT.center[0], BOOT.center[1]);
      addPoi('Food', BOOT.center[0] + 0.0021, BOOT.center[1] + 0.0015, '#FF9500', '&#127869;');
      addPoi('Transit', BOOT.center[0] - 0.0018, BOOT.center[1] - 0.001, '#007AFF', '&#128652;');
      addPoi('Shopping', BOOT.center[0] + 0.0011, BOOT.center[1] - 0.0019, '#FF2D55', '&#128717;');
      initGoogle();
    });
    function addPoi(name, lng, lat, color, icon) {
      const el = document.createElement('div');
      el.className = 'poi-marker';
      el.style.setProperty('--marker-color', color);
      el.innerHTML = icon;
      el.addEventListener('click', () => {
        document.querySelectorAll('.poi-marker').forEach((node) => node.classList.remove('active'));
        el.classList.add('active');
        updateSelectedPlace({ address: name + ' near ' + BOOT.place.name, lat, lng, name, placeId: '', verified: false });
      });
      new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
    }
    let longPressTimer;
    map.on('mousedown', (event) => {
      longPressTimer = setTimeout(() => reverseGeocode(event.lngLat.lng, event.lngLat.lat), 520);
    });
    map.on('mouseup', () => clearTimeout(longPressTimer));
    map.on('drag', () => clearTimeout(longPressTimer));
    map.on('rotate', () => {
      const bearing = map.getBearing();
      compass.classList.toggle('visible', Math.abs(bearing) > 1);
      compass.style.transform = 'rotate(' + (-bearing) + 'deg)';
    });
    compass.addEventListener('click', () => map.easeTo({ bearing: 0, duration: 450 }));
    document.getElementById('layersButton').addEventListener('click', () => map.easeTo({ pitch: map.getPitch() > 10 ? 0 : 34, duration: 450 }));
    locationButton.addEventListener('click', () => {
      if (!navigator.geolocation) return;
      locationButton.classList.add('tracking');
      navigator.geolocation.getCurrentPosition((position) => {
        userPosition = { lat: position.coords.latitude, lng: position.coords.longitude };
        const wrap = document.createElement('div');
        wrap.className = 'user-wrap';
        wrap.innerHTML = '<div class="user-dot"></div>';
        if (!userMarker) userMarker = new maplibregl.Marker({ element: wrap }).setLngLat([userPosition.lng, userPosition.lat]).addTo(map);
        else userMarker.setLngLat([userPosition.lng, userPosition.lat]);
        map.easeTo({ center: [userPosition.lng, userPosition.lat], duration: 800, zoom: 16.4 });
        buildRoute();
      }, () => locationButton.classList.remove('tracking'), { enableHighAccuracy: true, timeout: 9000 });
    });
    confirmButton.addEventListener('click', () => {
      if (!selectedPlace || !selectedPlace.verified || !selectedPlace.placeId) return;
      window.parent.postMessage({ type: 'confirmed-place', place: { address: selectedPlace.address, lat: selectedPlace.lat, lng: selectedPlace.lng, placeId: selectedPlace.placeId } }, '*');
    });
    document.getElementById('directionsButton').addEventListener('click', buildRoute);
    document.getElementById('sheetHandle').addEventListener('click', () => setSheet(sheet.classList.contains('half') ? 'full' : 'half'));
  </script>
</body>
</html>`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  mapFrame: {
    backgroundColor: "#F7F5EC",
    height: 560,
    overflow: "hidden",
    width: "100%",
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
  buttonDisabled: {
    opacity: 0.48,
  },
  secondaryButtonText: {
    color: "#1C1C1E",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
  },
  notice: {
    backgroundColor: "#FFF8E8",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  noticeText: {
    color: "#6C5A20",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
  noticeLink: {
    color: "#6C6C70",
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
});

const iframeStyle = {
  border: 0,
  height: "100%",
  width: "100%",
};
