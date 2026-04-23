import type { MapStyleElement } from 'react-native-maps';

export const premiumMapStyle: MapStyleElement[] = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#F6F4EF' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#7E858C' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#F6F4EF' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#DDD8CF' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6F7780' }],
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.business',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#EEF2EC' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#96A08F' }],
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#FFFFFF' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#ECE8E1' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#EBE7DF' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#DED8CF' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#F1EEE8' }],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [{ color: '#FBFAF7' }],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#DFE8EB' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8EA2AA' }],
  },
];

export const premiumMapPalette = {
  routeStroke: '#5EA1FF',
  routeStrokeMuted: 'rgba(94, 161, 255, 0.26)',
  userMarkerFill: '#8BC0FF',
  venueMarkerFill: '#1277FF',
  venueMarkerGlow: 'rgba(18, 119, 255, 0.28)',
  venueMarkerShadow: 'rgba(4, 11, 24, 0.32)',
  cardSurface: '#F8FAFC',
  cardSurfaceElevated: '#FFFFFF',
  cardBorder: 'rgba(15, 23, 42, 0.10)',
  overlaySurface: 'rgba(255, 255, 255, 0.86)',
  text: '#0F172A',
  textMuted: '#475569',
  textSubtle: '#64748B',
} as const;
