import { useRouter } from 'expo-router';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import React, { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  openExternalMaps,
  toCoordinate,
  type VenueMapData,
} from '@/lib/map-utils';

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

    ensureMapStyles();

    const map = new maplibregl.Map({
      attributionControl: false,
      bearing: 0,
      center: mapCenter,
      container: mapContainerRef.current,
      maxPitch: 45,
      pitch: 0,
      style: 'https://tiles.openfreemap.org/styles/bright',
      zoom: 14.65,
    });

    mapRef.current = map;

    map.on('load', () => {
      applyAppleMapsPaint(map);
      markerRef.current = createVenueMarker()
        .setLngLat(mapCenter)
        .addTo(map);
      addCustomControls(map, mapContainerRef.current!);
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
        pathname: '/event-directions/[id]',
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
        {React.createElement('div', {
          ref: mapContainerRef,
          style: domMapStyle,
        })}
        <View pointerEvents='none' style={styles.mapAttribution}>
          <Text style={styles.mapsText}>Maps</Text>
          <Text style={styles.legalText}>Legal</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole='button'
        onPress={handleOpenDirections}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Get Directions</Text>
      </Pressable>
    </View>
  );
}

function createVenueMarker() {
  const wrap = document.createElement('div');
  wrap.style.width = '32px';
  wrap.style.height = '32px';
  
  const inner = document.createElement('div');
  inner.className = 'purple-pulse-marker';
  wrap.appendChild(inner);

  return new maplibregl.Marker({
    anchor: 'center',
    element: wrap,
  });
}

function ensureMapStyles() {
  if (document.getElementById('custom-map-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'custom-map-styles';
  style.textContent = `
    .purple-pulse-marker {
      background: #6B4FBB;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      box-shadow: 0px 2px 8px rgba(0,0,0,0.2);
      height: 32px;
      width: 32px;
      animation: markerPulse 2s ease-in-out infinite;
      position: absolute;
      top: 0;
      left: 0;
    }
    @keyframes markerPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    .map-controls-overlay {
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
  `;
  document.head.appendChild(style);
}

function addCustomControls(map: MapLibreMap, container: HTMLElement) {
  if (container.querySelector('.map-controls-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'map-controls-overlay';

  // Zoom group (+/-)
  const zoomGroup = document.createElement('div');
  zoomGroup.className = 'map-control-group';

  const btnIn = document.createElement('button');
  btnIn.className = 'map-btn';
  btnIn.setAttribute('aria-label', 'Zoom in');
  btnIn.textContent = '+';
  btnIn.addEventListener('click', () => map.zoomIn());

  const divider = document.createElement('div');
  divider.className = 'map-divider';

  const btnOut = document.createElement('button');
  btnOut.className = 'map-btn';
  btnOut.setAttribute('aria-label', 'Zoom out');
  btnOut.textContent = '\u2212';
  btnOut.addEventListener('click', () => map.zoomOut());

  zoomGroup.appendChild(btnIn);
  zoomGroup.appendChild(divider);
  zoomGroup.appendChild(btnOut);

  // Fullscreen group
  const fsGroup = document.createElement('div');
  fsGroup.className = 'map-control-group';

  const btnFs = document.createElement('button');
  btnFs.className = 'map-btn';
  btnFs.setAttribute('aria-label', 'View fullscreen');

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', '22');
  svg.setAttribute('height', '22');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', '#1A1A1A');
  svg.setAttribute('stroke-width', '2.5');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');

  const paths = [
    'M5 9V5h4', 'M19 9V5h-4',
    'M5 15v4h4', 'M19 15v4h-4',
  ];
  paths.forEach((d) => {
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
  });
  const circle = document.createElementNS(svgNS, 'circle');
  circle.setAttribute('cx', '12');
  circle.setAttribute('cy', '12');
  circle.setAttribute('r', '3');
  svg.appendChild(circle);

  btnFs.appendChild(svg);
  btnFs.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  });

  fsGroup.appendChild(btnFs);

  overlay.appendChild(zoomGroup);
  overlay.appendChild(fsGroup);
  container.appendChild(overlay);
}

function applyAppleMapsPaint(map: MapLibreMap) {
  const loadedStyle = map.getStyle();

  (loadedStyle.layers || []).forEach((layer) => {
    const sourceLayer = String(
      (layer as { 'source-layer'?: string })['source-layer'] || '',
    ).toLowerCase();
    const id = layer.id.toLowerCase();
    const name = `${id} ${sourceLayer}`;

    try {
      if (layer.type === 'background') {
        map.setPaintProperty(layer.id, 'background-color', '#F6F5F1');
      } else if (layer.type === 'fill' && name.includes('water')) {
        map.setPaintProperty(layer.id, 'fill-color', '#B7DDEA');
      } else if (
        layer.type === 'fill' &&
        /(park|landcover|wood|grass|green)/.test(name)
      ) {
        map.setPaintProperty(layer.id, 'fill-color', '#DCECC9');
      } else if (layer.type === 'fill' && name.includes('building')) {
        map.setPaintProperty(layer.id, 'fill-color', '#EAE8E2');
      } else if (
        layer.type === 'line' &&
        /(road|transport|highway|street)/.test(name)
      ) {
        map.setPaintProperty(
          layer.id,
          'line-color',
          /(case|outline|border)/.test(name) ? '#D1D2CF' : '#FFFCF7',
        );
        map.setPaintProperty(layer.id, 'line-opacity', 0.96);
      } else if (layer.type === 'line' && name.includes('boundary')) {
        map.setPaintProperty(layer.id, 'line-color', '#D4D0CA');
        map.setPaintProperty(layer.id, 'line-opacity', 0.32);
      } else if (layer.type === 'symbol') {
        map.setPaintProperty(
          layer.id,
          'text-color',
          /(place|city|town)/.test(name) ? '#4D4742' : '#827E79',
        );
        map.setPaintProperty(layer.id, 'text-halo-color', '#F6F5F1');
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
