import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { VenueMapMarker } from '@/components/events/venue-map-marker';
import { premiumMapStyle } from '@/constants/premium-map-style';
import { ticketColors, ticketRadii, ticketSpacing } from '@/constants/ticket-theme';
import { useCurrentLocation } from '@/hooks/use-current-location';
import {
  canRenderEmbeddedMap,
  getMapEdgePadding,
  getRegionForCoordinates,
  openExternalMaps,
  toCoordinate,
  type VenueMapData,
} from '@/lib/map-utils';

export function VenueMapCard({
  eventId,
  latitude,
  longitude,
  venueAddress,
  venueName,
  venueSummary,
}: VenueMapData) {
  const router = useRouter();
  const venueCoordinate = useMemo(
    () => toCoordinate(latitude, longitude),
    [latitude, longitude],
  );
  const canShowEmbeddedMap = canRenderEmbeddedMap();
  const mapRef = useRef<MapView | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const {
    currentLocation,
    error: locationError,
    isCheckingPermission,
    isLoadingLocation,
    permissionStatus,
    refreshLocation,
  } = useCurrentLocation();

  useEffect(() => {
    if (!mapReady || !venueCoordinate || !mapRef.current) {
      return;
    }

    const coordinates = currentLocation
      ? [currentLocation, venueCoordinate]
      : [venueCoordinate];

    if (coordinates.length > 1) {
      mapRef.current.fitToCoordinates(coordinates, {
        animated: true,
        edgePadding: getMapEdgePadding(),
      });
      return;
    }

    mapRef.current.animateToRegion(getRegionForCoordinates(coordinates), 350);
  }, [currentLocation, mapReady, venueCoordinate]);

  async function handleOpenExternalMaps() {
    if (!venueCoordinate) {
      return;
    }

    await openExternalMaps({
      destination: venueCoordinate,
      destinationLabel: venueName,
      origin: currentLocation,
    });
  }

  function handleOpenDirections() {
    if (!venueCoordinate) {
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

  async function handleRetryLocation() {
    await refreshLocation();
  }

  const helperState =
    !canShowEmbeddedMap
      ? 'External maps only'
      : permissionStatus === 'denied'
        ? 'Venue preview only'
        : permissionStatus === 'granted' && currentLocation
          ? 'Current location active'
          : isCheckingPermission || isLoadingLocation
            ? 'Checking location'
            : 'Venue preview ready';

  const mapPresentationProps =
    Platform.OS === 'android'
      ? { customMapStyle: premiumMapStyle, mapType: 'standard' as const }
      : {
          mapType: 'standard' as const,
          userInterfaceStyle: 'dark' as const,
        };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Venue</Text>
          <Text style={styles.title}>{venueName}</Text>
          {venueAddress ? <Text style={styles.address}>{venueAddress}</Text> : null}
          <Text style={styles.body}>
            {venueSummary ??
              'Preview the venue, center yourself on the map, and open a cleaner in-app directions view.'}
          </Text>
        </View>

        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>{helperState}</Text>
        </View>
      </View>

      {venueCoordinate && canShowEmbeddedMap ? (
        <View style={[styles.mapShell, styles.fullBleedMapShell]}>
          <MapView
            {...mapPresentationProps}
            initialRegion={getRegionForCoordinates([venueCoordinate])}
            loadingEnabled
            mapPadding={getMapEdgePadding()}
            onMapReady={() => setMapReady(true)}
            pitchEnabled={false}
            ref={mapRef}
            rotateEnabled={false}
            scrollEnabled
            showsBuildings={false}
            showsCompass={false}
            showsIndoorLevelPicker={false}
            showsIndoors={false}
            showsPointsOfInterest={false}
            showsTraffic={false}
            style={styles.map}
            toolbarEnabled={false}
            zoomEnabled>
            <Marker coordinate={venueCoordinate} identifier="venue" tracksViewChanges>
              <VenueMapMarker />
            </Marker>

            {currentLocation ? (
              <Marker coordinate={currentLocation} identifier="user" tracksViewChanges={false}>
                <View style={styles.userMarker}>
                  <View style={styles.userMarkerDot} />
                </View>
              </Marker>
            ) : null}
          </MapView>

          {isCheckingPermission || isLoadingLocation ? (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingCard}>
                <ActivityIndicator color={ticketColors.primary} size="small" />
                <View style={styles.loadingCopy}>
                  <View style={styles.skeletonLineShort} />
                  <View style={styles.skeletonLineLong} />
                </View>
              </View>
            </View>
          ) : null}

          <View style={styles.overlayBadge}>
            <Ionicons color="#FFFFFF" name="navigate-outline" size={14} />
            <Text style={styles.overlayBadgeText}>Premium venue preview</Text>
          </View>
        </View>
      ) : venueCoordinate ? (
        <View style={[styles.emptyMapState, styles.fullBleedMapShell]}>
          <Ionicons color={ticketColors.primaryBright} name="navigate-circle-outline" size={28} />
          <Text style={styles.emptyMapTitle}>Open this venue in your maps app</Text>
          <Text style={styles.emptyMapBody}>
            This Android build was shipped without an embedded Google Maps key, so the in-app map
            preview is disabled. Directions can still open in your preferred maps app.
          </Text>
        </View>
      ) : (
        <View style={[styles.emptyMapState, styles.fullBleedMapShell]}>
          <Ionicons color={ticketColors.textSubtle} name="map-outline" size={28} />
          <Text style={styles.emptyMapTitle}>Venue map unavailable</Text>
          <Text style={styles.emptyMapBody}>
            We&apos;re missing coordinates for this venue, so directions can only be opened once
            the location is added.
          </Text>
        </View>
      )}

      {locationError ? (
        <View style={styles.messageBanner}>
          <Ionicons
            color={
              permissionStatus === 'denied'
                ? ticketColors.warning
                : ticketColors.textSubtle
            }
            name={
              permissionStatus === 'denied'
                ? 'alert-circle-outline'
                : 'locate-outline'
            }
            size={18}
          />
          <Text style={styles.messageBannerText}>{locationError}</Text>
        </View>
      ) : null}

      {!canShowEmbeddedMap && venueCoordinate ? (
        <View style={styles.messageBanner}>
          <Ionicons color={ticketColors.primaryBright} name="information-circle-outline" size={18} />
          <Text style={styles.messageBannerText}>
            Embedded maps are off for this Android build. Use directions or open the venue in Maps.
          </Text>
        </View>
      ) : null}

      <View style={styles.buttonRow}>
        <Pressable
          accessibilityRole="button"
          disabled={!venueCoordinate}
          onPress={handleOpenDirections}
          style={[styles.primaryButton, !venueCoordinate && styles.primaryButtonDisabled]}>
          <Text style={styles.primaryButtonText}>Get Directions</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={!venueCoordinate}
          onPress={handleOpenExternalMaps}
          style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Open in Maps</Text>
        </Pressable>
      </View>

      {permissionStatus === 'granted' && !currentLocation && !isLoadingLocation ? (
        <Pressable
          accessibilityRole="button"
          onPress={handleRetryLocation}
          style={styles.inlineAction}>
          <Text style={styles.inlineActionText}>Retry current location</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    gap: ticketSpacing.sm,
    padding: ticketSpacing.md,
  },
  headerRow: {
    gap: ticketSpacing.xs,
  },
  headerCopy: {
    gap: ticketSpacing.xs,
  },
  eyebrow: {
    color: ticketColors.primaryBright,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  title: {
    color: ticketColors.text,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 25,
  },
  address: {
    color: ticketColors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  body: {
    color: ticketColors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
  },
  statusPill: {
    alignSelf: 'flex-start',
    backgroundColor: ticketColors.primarySoft,
    borderRadius: ticketRadii.pill,
    paddingHorizontal: ticketSpacing.sm,
    paddingVertical: ticketSpacing.xs,
  },
  statusPillText: {
    color: ticketColors.primaryBright,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  mapShell: {
    backgroundColor: '#0B1220',
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    height: 300,
    overflow: 'hidden',
    position: 'relative',
  },
  fullBleedMapShell: {
    marginHorizontal: -ticketSpacing.lg,
  },
  map: {
    height: '100%',
    width: '100%',
  },
  userMarker: {
    alignItems: 'center',
    backgroundColor: 'rgba(94, 161, 255, 0.26)',
    borderRadius: ticketRadii.pill,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  userMarkerDot: {
    backgroundColor: '#8BC0FF',
    borderColor: '#FFFFFF',
    borderRadius: ticketRadii.pill,
    borderWidth: 3,
    height: 14,
    width: 14,
  },
  overlayBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(8, 13, 24, 0.82)',
    borderRadius: ticketRadii.pill,
    flexDirection: 'row',
    gap: ticketSpacing.xs,
    left: ticketSpacing.md,
    paddingHorizontal: ticketSpacing.xs,
    paddingVertical: ticketSpacing.xxs,
    position: 'absolute',
    top: ticketSpacing.md,
  },
  overlayBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(8, 13, 24, 0.38)',
    justifyContent: 'center',
  },
  loadingCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: ticketRadii.md,
    flexDirection: 'row',
    gap: ticketSpacing.sm,
    paddingHorizontal: ticketSpacing.sm,
    paddingVertical: ticketSpacing.xs,
  },
  loadingCopy: {
    gap: ticketSpacing.xs,
  },
  skeletonLineShort: {
    backgroundColor: ticketColors.chromeSoft,
    borderRadius: ticketRadii.pill,
    height: 8,
    width: 84,
  },
  skeletonLineLong: {
    backgroundColor: ticketColors.chromeSoft,
    borderRadius: ticketRadii.pill,
    height: 8,
    width: 128,
  },
  messageBanner: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(154, 103, 0, 0.10)',
    borderRadius: ticketRadii.md,
    flexDirection: 'row',
    gap: ticketSpacing.xs,
    paddingHorizontal: ticketSpacing.xs,
    paddingVertical: ticketSpacing.xs,
  },
  messageBannerText: {
    color: ticketColors.text,
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: ticketSpacing.sm,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: ticketColors.primary,
    borderRadius: ticketRadii.md,
    flex: 1.2,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: ticketSpacing.md,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.borderStrong,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: ticketSpacing.md,
  },
  secondaryButtonText: {
    color: ticketColors.text,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
  inlineAction: {
    alignSelf: 'flex-start',
  },
  inlineActionText: {
    color: ticketColors.primaryBright,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  emptyMapState: {
    alignItems: 'center',
    backgroundColor: ticketColors.chromeElevated,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    gap: ticketSpacing.sm,
    paddingHorizontal: ticketSpacing.md,
    paddingVertical: ticketSpacing.lg,
  },
  emptyMapTitle: {
    color: ticketColors.text,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 20,
  },
  emptyMapBody: {
    color: ticketColors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
    textAlign: 'center',
  },
});
