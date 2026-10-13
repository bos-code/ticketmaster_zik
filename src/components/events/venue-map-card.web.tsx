import { Text } from '@/components/ui/app-text';
import { useRouter } from 'expo-router';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import {
  openExternalMaps,
  type VenueMapData,
} from '@/lib/map-utils';
import { useVenueCoordinate } from '@/hooks/use-venue-coordinate';
import { VenueMapPlaceholder } from '@/components/events/venue-map-placeholder';

export function VenueMapCard({
  appearance = 'light',
  eventId,
  latitude,
  longitude,
  mapHeight = 560,
  venueAddress,
  venueName,
}: VenueMapData & { mapHeight?: number; appearance?: 'light' | 'dark' }) {
  const router = useRouter();
  const dark = appearance === 'dark';
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const { coordinate: venueCoordinate, isLoading, retry } = useVenueCoordinate({ latitude, longitude, venueName, venueAddress });
  const [mapFailed, setMapFailed] = useState(false);
  const [mapAttempt, setMapAttempt] = useState(0);
  const resolvedLatitude = venueCoordinate?.latitude;
  const resolvedLongitude = venueCoordinate?.longitude;
  const mapCenter = useMemo(
    () =>
      resolvedLatitude !== undefined && resolvedLongitude !== undefined ? [resolvedLongitude, resolvedLatitude] as [number, number] : null,
    [resolvedLatitude, resolvedLongitude],
  );

  useEffect(() => {
    if (!mapCenter || !mapContainerRef.current || mapRef.current) {
      return;
    }

    ensureAppleMarkerStyles();

    let map: MapLibreMap;
    try {
      map = new maplibregl.Map({
        attributionControl: { compact: true },
        bearing: 0,
        center: mapCenter,
        container: mapContainerRef.current,
        maxPitch: 45,
        pitch: 0,
        style: 'https://tiles.openfreemap.org/styles/bright',
        zoom: 14.65,
      });
    } catch {
      setMapFailed(true);
      return;
    }

    mapRef.current = map;

    map.on('load', () => {
      setMapFailed(false);
      applyAppleMapsPaint(map, dark);
      markerRef.current = createVenueMarker(venueName, dark)
        .setLngLat(mapCenter)
        .addTo(map);
    });
    map.on('error', () => setMapFailed(true));

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(mapContainerRef.current);
    return () => {
      resizeObserver.disconnect();
      markerRef.current?.remove();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [dark, mapCenter, venueName, mapAttempt]);

  function handleRetry() {
    setMapFailed(false);
    setMapAttempt((attempt) => attempt + 1);
    if (!venueCoordinate) retry();
  }

  function handleOpenDirections() {
    if (dark) {
      if (venueCoordinate) {
        void openExternalMaps({ destination: venueCoordinate, destinationLabel: venueName, origin: null });
      } else {
        void Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent([venueName, venueAddress].filter(Boolean).join(', '))}`);
      }
      return;
    }
    if (eventId) {
      router.push({
        pathname: '/event-directions/[id]',
        params: { id: eventId },
      });
      return;
    }

    void handleOpenExternalMaps();
  }

  async function handleOpenExternalMaps() {
    if (!venueCoordinate) {
      await Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent([venueName, venueAddress].filter(Boolean).join(', '))}`);
      return;
    }
    await openExternalMaps({
      destination: venueCoordinate,
      destinationLabel: venueName,
      origin: null,
    });
  }

  return (
    <View style={[styles.card, dark && { backgroundColor: '#242424' }]}>
      <View style={[styles.mapFrame, { height: mapHeight }, dark && { backgroundColor: '#25363C' }]}>
        {venueCoordinate && React.createElement('div', {
          ref: mapContainerRef,
          role: 'region',
          'aria-label': `${venueName} map`,
          style: domMapStyle,
        })}
        {dark && <View pointerEvents='none' style={{ position: 'absolute', top: 14, left: 16, right: 16 }}><Text style={{ color: '#FFFFFF', fontSize: 23, fontWeight: '700', textShadowColor: '#111111', textShadowRadius: 4 }}>{venueName}</Text></View>}
        {(!venueCoordinate || mapFailed) && <VenueMapPlaceholder dark={dark} isLoading={isLoading} onRetry={handleRetry} venueAddress={venueAddress || venueName} />}
        {!dark && <View pointerEvents='none' style={styles.mapAttribution}>
          <Text style={styles.mapsText}>Maps</Text>
          <Text style={styles.legalText}>Legal</Text>
        </View>}
      </View>

      <Pressable
        accessibilityRole='button'
        onPress={handleOpenDirections}
        style={[styles.button, dark && { backgroundColor: '#242424', minHeight: 48 }]}
      >
        <Text style={[styles.buttonText, dark && { color: '#FFFFFF' }]}>Get Directions</Text>
      </Pressable>
    </View>
  );
}

function createVenueMarker(venueName: string, dark: boolean) {
  const markerWrap = document.createElement('div');
  markerWrap.className = 'apple-venue-marker';

  const markerLabel = document.createElement('div');
  markerLabel.className = 'apple-venue-label';
  markerLabel.textContent = venueName;
  if (dark) { markerLabel.style.color = '#FFFFFF'; markerLabel.style.textShadow = '0 1px 3px #111111'; }

  const markerElement = document.createElement('div');
  markerElement.className = 'apple-venue-pin';

  const info = document.createElement('div');
  info.className = 'apple-venue-pin-info';
  info.textContent = 'i';
  markerElement.appendChild(info);

  markerWrap.appendChild(markerElement);
  markerWrap.appendChild(markerLabel);

  return new maplibregl.Marker({
    anchor: 'bottom',
    element: markerWrap,
    offset: [0, 2],
  });
}

function ensureAppleMarkerStyles() {
  if (document.getElementById('apple-marker-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'apple-marker-styles';
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

function applyAppleMapsPaint(map: MapLibreMap, dark: boolean) {
  const loadedStyle = map.getStyle();

  (loadedStyle.layers || []).forEach((layer) => {
    const sourceLayer = String(
      (layer as { 'source-layer'?: string })['source-layer'] || '',
    ).toLowerCase();
    const id = layer.id.toLowerCase();
    const name = `${id} ${sourceLayer}`;

    try {
      if (layer.type === 'background') {
        map.setPaintProperty(layer.id, 'background-color', (dark ? '#28343B' : '#F6F5F1'));
      } else if (layer.type === 'fill' && name.includes('water')) {
        map.setPaintProperty(layer.id, 'fill-color', (dark ? '#174C73' : '#B7DDEA'));
      } else if (
        layer.type === 'fill' &&
        /(park|landcover|wood|grass|green)/.test(name)
      ) {
        map.setPaintProperty(layer.id, 'fill-color', (dark ? '#17493C' : '#DCECC9'));
      } else if (layer.type === 'fill' && name.includes('building')) {
        map.setPaintProperty(layer.id, 'fill-color', (dark ? '#3A4850' : '#EAE8E2'));
      } else if (
        layer.type === 'line' &&
        /(road|transport|highway|street)/.test(name)
      ) {
        map.setPaintProperty(
          layer.id,
          'line-color',
          /(case|outline|border)/.test(name) ? (dark ? '#34434D' : '#D1D2CF') : (dark ? '#68777F' : '#FFFCF7'),
        );
        map.setPaintProperty(layer.id, 'line-opacity', 0.96);
      } else if (layer.type === 'line' && name.includes('boundary')) {
        map.setPaintProperty(layer.id, 'line-color', (dark ? '#65747C' : '#D4D0CA'));
        map.setPaintProperty(layer.id, 'line-opacity', 0.32);
      } else if (layer.type === 'symbol') {
        map.setPaintProperty(
          layer.id,
          'text-color',
          /(place|city|town)/.test(name) ? (dark ? '#FFFFFF' : '#4D4742') : (dark ? '#C0CBCF' : '#827E79'),
        );
        map.setPaintProperty(layer.id, 'text-halo-color', (dark ? '#28343B' : '#F6F5F1'));
        map.setPaintProperty(layer.id, 'text-halo-width', 1.9);
      }
    } catch {
      // Some third-party style layers do not expose every paint property.
    }
  });
}

const domMapStyle: React.CSSProperties = {
  bottom: 0,
  left: 0,
  position: 'absolute',
  right: 0,
  top: 0,
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  mapFrame: {
    backgroundColor: '#F6F5F1',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  mapAttribution: {
    alignItems: 'center',
    bottom: 9,
    flexDirection: 'row',
    gap: 6,
    left: 14,
    position: 'absolute',
  },
  mapsText: {
    color: '#4B4B4B',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0,
  },
  legalText: {
    color: '#4F4F4F',
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 0,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#F2F1F5',
    justifyContent: 'center',
    minHeight: 50,
    paddingVertical: 0,
  },
  buttonText: {
    color: '#272529',
    fontSize: 16,
    fontWeight: '700',
  },
});
