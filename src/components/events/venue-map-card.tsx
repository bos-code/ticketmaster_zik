import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { premiumMapPalette, premiumMapStyle } from '@/constants/premium-map-style';
import { ticketColors, ticketRadii, ticketSpacing } from '@/constants/ticket-theme';
import { useCurrentLocation } from '@/hooks/use-current-location';
import { getRoutePreview } from '@/lib/directions';
import {
  getMapEdgePadding,
  getRegionForCoordinates,
  openExternalMaps,
  toCoordinate,
  type VenueMapData,
} from '@/lib/map-utils';

type RouteState = Awaited<ReturnType<typeof getRoutePreview>>;

export function VenueMapCard({
  latitude,
  longitude,
  venueAddress,
  venueName,
  venueSummary,
}: VenueMapData) {
  const venueCoordinate = useMemo(
    () => toCoordinate(latitude, longitude),
    [latitude, longitude],
  );
  const mapRef = useRef<MapView | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [routePreview, setRoutePreview] = useState<RouteState | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const {
    currentLocation,
    ensureCurrentLocation,
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

    const coordinates = routePreview?.coordinates?.length
      ? routePreview.coordinates
      : currentLocation
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
  }, [currentLocation, mapReady, routePreview, venueCoordinate]);

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

  async function handleGetDirections() {
    if (!venueCoordinate) {
      setRouteError('Venue coordinates are unavailable for this event.');
      return;
    }

    setRouteError(null);
    setIsRouting(true);

    try {
      const origin = await ensureCurrentLocation(true);

      if (!origin) {
        setRouteError(
          locationError ??
            'Current location is unavailable. You can still open directions in your maps app.',
        );
        return;
      }

      const preview = await getRoutePreview({
        origin,
        destination: venueCoordinate,
      });

      setRoutePreview(preview);
      if (preview.notice) {
        setRouteError(preview.notice);
      }
    } catch {
      setRouteError('Unable to build a route preview right now.');
    } finally {
      setIsRouting(false);
    }
  }

  async function handleRetryLocation() {
    await refreshLocation();
  }

  const helperState =
    permissionStatus === 'denied'
      ? 'Location blocked'
      : permissionStatus === 'granted' && currentLocation
        ? 'Current location active'
        : 'Venue preview ready';
  const mapPresentationProps =
    Platform.OS === 'android'
      ? { customMapStyle: premiumMapStyle }
      : { mapType: 'mutedStandard' as const };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Venue</Text>
          <Text style={styles.title}>{venueName}</Text>
          {venueAddress ? <Text style={styles.address}>{venueAddress}</Text> : null}
          <Text style={styles.body}>
            {venueSummary ??
              'Zoom in, preview the venue location, and pull directions without leaving the event flow.'}
          </Text>
        </View>

        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>{helperState}</Text>
        </View>
      </View>

      {venueCoordinate ? (
        <View style={[styles.mapShell, styles.fullBleedMapShell]}>
          <MapView
            {...mapPresentationProps}
            initialRegion={getRegionForCoordinates([venueCoordinate])}
            loadingEnabled
            mapPadding={getMapEdgePadding()}
            onMapReady={() => setMapReady(true)}
            ref={mapRef}
            rotateEnabled={false}
            showsBuildings={false}
            showsCompass={false}
            showsIndoorLevelPicker={false}
            showsIndoors={false}
            showsPointsOfInterest={false}
            showsTraffic={false}
            style={styles.map}
            toolbarEnabled={false}>
            <Marker coordinate={venueCoordinate} identifier="venue" tracksViewChanges={false}>
              <View style={styles.venueMarker}>
                <View style={styles.venueMarkerHalo}>
                  <View style={styles.venueMarkerDot}>
                    <Ionicons color="#FFFFFF" name="location-sharp" size={12} />
                  </View>
                </View>
              </View>
            </Marker>

            {currentLocation ? (
              <Marker coordinate={currentLocation} identifier="user" tracksViewChanges={false}>
                <View style={styles.userMarker}>
                  <View style={styles.userMarkerDot} />
                </View>
              </Marker>
            ) : null}

            {routePreview?.coordinates?.length ? (
              <Polyline
                coordinates={routePreview.coordinates}
                lineCap="round"
                lineJoin="round"
                strokeColor={premiumMapPalette.routeStroke}
                strokeWidth={5}
              />
            ) : null}
          </MapView>

          {isCheckingPermission || isLoadingLocation || isRouting ? (
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
            <Text style={styles.overlayBadgeText}>
              {routePreview?.source === 'google' ? 'Live route preview' : 'Interactive venue map'}
            </Text>
          </View>
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

      {routePreview ? (
        <View style={styles.routeSummaryCard}>
          <View style={styles.routeMetricRow}>
            <RouteMetric label="Distance" value={routePreview.distanceLabel} />
            <RouteMetric label="ETA" value={routePreview.durationLabel} />
            <RouteMetric
              label="Route"
              value={routePreview.source === 'google' ? 'In app' : 'Approx.'}
            />
          </View>

          {routePreview.steps.length ? (
            <View style={styles.stepsWrap}>
              <Text style={styles.stepsTitle}>Next steps</Text>
              {routePreview.steps.map((step, index) => (
                <View key={`${step}-${index}`} style={styles.stepRow}>
                  <Text style={styles.stepIndex}>{`${index + 1}.`}</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {routeError ? (
        <View style={styles.messageBanner}>
          <Ionicons color={ticketColors.warning} name="alert-circle-outline" size={18} />
          <Text style={styles.messageBannerText}>{routeError}</Text>
        </View>
      ) : null}

      {!routeError && locationError && permissionStatus === 'granted' ? (
        <View style={styles.messageBanner}>
          <Ionicons color={ticketColors.textSubtle} name="locate-outline" size={18} />
          <Text style={styles.messageBannerText}>{locationError}</Text>
        </View>
      ) : null}

      <View style={styles.buttonRow}>
        <Pressable
          accessibilityRole="button"
          disabled={!venueCoordinate || isRouting}
          onPress={handleGetDirections}
          style={[
            styles.primaryButton,
            (!venueCoordinate || isRouting) && styles.primaryButtonDisabled,
          ]}>
          <Text style={styles.primaryButtonText}>
            {isRouting
              ? 'Loading Route...'
              : routePreview
                ? 'Refresh Directions'
                : 'Get Directions'}
          </Text>
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
        <Pressable accessibilityRole="button" onPress={handleRetryLocation} style={styles.inlineAction}>
          <Text style={styles.inlineActionText}>Retry current location</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function RouteMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.routeMetricCard}>
      <Text style={styles.routeMetricLabel}>{label}</Text>
      <Text style={styles.routeMetricValue}>{value}</Text>
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
    backgroundColor: ticketColors.chromeElevated,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    height: 280,
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
  venueMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueMarkerHalo: {
    alignItems: 'center',
    backgroundColor: premiumMapPalette.venueMarkerGlow,
    borderRadius: ticketRadii.pill,
    height: 42,
    justifyContent: 'center',
    shadowColor: premiumMapPalette.venueMarkerShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    width: 42,
  },
  venueMarkerDot: {
    alignItems: 'center',
    backgroundColor: premiumMapPalette.venueMarkerFill,
    borderColor: '#FFFFFF',
    borderRadius: ticketRadii.pill,
    borderWidth: 3,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  userMarker: {
    alignItems: 'center',
    backgroundColor: premiumMapPalette.routeStrokeMuted,
    borderRadius: ticketRadii.pill,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  userMarkerDot: {
    backgroundColor: premiumMapPalette.userMarkerFill,
    borderColor: '#FFFFFF',
    borderRadius: ticketRadii.pill,
    borderWidth: 3,
    height: 14,
    width: 14,
  },
  overlayBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
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
    backgroundColor: 'rgba(248, 250, 252, 0.72)',
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
  routeSummaryCard: {
    backgroundColor: ticketColors.chromeElevated,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    gap: ticketSpacing.sm,
    padding: ticketSpacing.sm,
  },
  routeMetricRow: {
    flexDirection: 'row',
    gap: ticketSpacing.sm,
  },
  routeMetricCard: {
    backgroundColor: ticketColors.chrome,
    borderRadius: ticketRadii.md,
    flex: 1,
    gap: ticketSpacing.xxs,
    padding: ticketSpacing.xs,
  },
  routeMetricLabel: {
    color: ticketColors.textSubtle,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  routeMetricValue: {
    color: ticketColors.text,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
  stepsWrap: {
    gap: ticketSpacing.xs,
  },
  stepsTitle: {
    color: ticketColors.text,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  stepRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: ticketSpacing.xs,
  },
  stepIndex: {
    color: ticketColors.primaryBright,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
  },
  stepText: {
    color: ticketColors.textMuted,
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
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
