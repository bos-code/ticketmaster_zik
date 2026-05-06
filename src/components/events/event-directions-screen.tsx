import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VenueMapMarker } from '@/components/events/venue-map-marker';
import {
  premiumMapPalette,
  premiumMapStyle,
} from '@/constants/premium-map-style';
import { ticketColors, ticketRadii, ticketSpacing } from '@/constants/ticket-theme';
import { useCurrentLocation } from '@/hooks/use-current-location';
import { getRoutePreview } from '@/lib/directions';
import {
  canRenderEmbeddedMap,
  getMapEdgePadding,
  getRegionForCoordinates,
  openExternalMaps,
  toCoordinate,
} from '@/lib/map-utils';
import { selectEventById, useEventStore } from '@/store/use-event-store';

type RouteState = Awaited<ReturnType<typeof getRoutePreview>>;

export function EventDirectionsScreen({ eventId }: { eventId: string }) {
  const event = useEventStore((state) => selectEventById(state, eventId));
  const venueCoordinate = useMemo(
    () => toCoordinate(event?.latitude, event?.longitude),
    [event?.latitude, event?.longitude],
  );
  const canShowEmbeddedMap = canRenderEmbeddedMap();
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

  const buildRoute = useCallback(
    async (requestIfNeeded = false) => {
      if (!venueCoordinate) {
        setRouteError('Venue coordinates are unavailable for this event.');
        return;
      }

      setIsRouting(true);
      setRouteError(null);

      try {
        const origin = await ensureCurrentLocation(requestIfNeeded);

        if (!origin) {
          setRoutePreview(null);
          setRouteError(
            locationError ??
              'Enable location access to preview your route in the app.',
          );
          return;
        }

        const preview = await getRoutePreview({
          origin,
          destination: venueCoordinate,
        });

        setRoutePreview(preview);
        setRouteError(preview.notice ?? null);
      } catch {
        setRoutePreview(null);
        setRouteError('Unable to build the route right now.');
      } finally {
        setIsRouting(false);
      }
    },
    [ensureCurrentLocation, locationError, venueCoordinate],
  );

  useEffect(() => {
    if (!venueCoordinate) {
      return;
    }

    void buildRoute(true);
  }, [buildRoute, venueCoordinate]);

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
    if (!event || !venueCoordinate) {
      return;
    }

    await openExternalMaps({
      destination: venueCoordinate,
      destinationLabel: event.venue,
      origin: currentLocation,
    });
  }

  async function handleRetryLocation() {
    await refreshLocation();
    await buildRoute(false);
  }

  function handleRecenter() {
    if (!mapReady || !mapRef.current || !venueCoordinate) {
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
  }

  const mapPresentationProps =
    Platform.OS === 'android'
      ? { customMapStyle: premiumMapStyle, mapType: 'standard' as const }
      : {
          mapType: 'standard' as const,
          userInterfaceStyle: 'dark' as const,
        };
  if (!event || !venueCoordinate) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar style="light" />
        <View style={styles.notFoundWrap}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}>
            <Ionicons color="#FFFFFF" name="arrow-back" size={20} />
          </Pressable>

          <View style={styles.notFoundCard}>
            <Text style={styles.notFoundEyebrow}>Directions</Text>
            <Text style={styles.notFoundTitle}>Venue location unavailable.</Text>
            <Text style={styles.notFoundBody}>
              We couldn&apos;t load the destination coordinates for this event, so the in-app route
              preview is unavailable.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!canShowEmbeddedMap) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar style="light" />

        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}>
            <Ionicons color="#FFFFFF" name="arrow-back" size={20} />
          </Pressable>

          <View style={styles.headerCopy}>
            <Text numberOfLines={1} style={styles.headerTitle}>
              Directions
            </Text>
            <Text numberOfLines={1} style={styles.headerSubtitle}>
              {event.venue}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.noMapContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.noMapHero}>
            <Ionicons color="#8BC0FF" name="navigate-circle-outline" size={34} />
            <Text style={styles.noMapHeroTitle}>In-app map preview is disabled here.</Text>
            <Text style={styles.noMapHeroBody}>
              This Android build is running without a Google Maps SDK key, so we&apos;re using a
              route summary fallback instead. You can still refresh the route and open your device
              maps app for turn-by-turn navigation.
            </Text>
          </View>

          <View style={[styles.sheet, styles.noMapSheet]}>
            <View style={styles.eventRow}>
              <Image contentFit="cover" source={{ uri: event.imageUrl }} style={styles.eventThumb} />
              <View style={styles.eventCopy}>
                <Text style={styles.sheetEyebrow}>{event.date}</Text>
                <Text numberOfLines={2} style={styles.sheetTitle}>
                  {event.title}
                </Text>
                <Text numberOfLines={1} style={styles.sheetVenue}>
                  {event.venueAddress}
                </Text>
              </View>
            </View>

            <View style={styles.metricRow}>
              <RouteMetric label="Distance" value={routePreview?.distanceLabel ?? '--'} />
              <RouteMetric label="ETA" value={routePreview?.durationLabel ?? '--'} />
              <RouteMetric
                label="Route"
                value={
                  routePreview
                    ? routePreview.source === 'google'
                      ? 'Live'
                      : 'Approx.'
                    : 'Pending'
                }
              />
            </View>

            <View style={styles.messageBanner}>
              <Ionicons color="#8BC0FF" name="information-circle-outline" size={18} />
              <Text style={styles.messageBannerText}>
                Open in Maps will still launch external navigation even without the embedded map.
              </Text>
            </View>

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

            {routePreview?.steps.length ? (
              <ScrollView
                contentContainerStyle={styles.stepsWrap}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                style={styles.stepsScroll}>
                {routePreview.steps.map((step, index) => (
                  <View key={`${step}-${index}`} style={styles.stepRow}>
                    <Text style={styles.stepIndex}>{`${index + 1}.`}</Text>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.helperCard}>
                <Text style={styles.helperTitle}>
                  {permissionStatus === 'denied'
                    ? 'Enable location to preview your route.'
                    : routePreview
                      ? 'Your route summary is ready.'
                      : 'Checking your route...'}
                </Text>
                <Text style={styles.helperBody}>
                  {permissionStatus === 'denied'
                    ? 'You can still open the venue in Maps even if location access stays off.'
                    : 'We can still estimate distance and hand off to external navigation when you need turn-by-turn guidance.'}
                </Text>
              </View>
            )}

            <View style={styles.actionRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => buildRoute(true)}
                style={styles.primaryButton}>
                {isRouting || isCheckingPermission || isLoadingLocation ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {routePreview ? 'Refresh Route' : 'Build Route'}
                  </Text>
                )}
              </Pressable>

              <Pressable
                accessibilityRole="button"
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
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <MapView
        {...mapPresentationProps}
        initialRegion={getRegionForCoordinates([venueCoordinate])}
        loadingEnabled
        mapPadding={getMapEdgePadding()}
        onMapReady={() => setMapReady(true)}
        pitchEnabled={false}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
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

        {routePreview?.coordinates?.length ? (
          <>
            <Polyline
              coordinates={routePreview.coordinates}
              lineCap="round"
              lineJoin="round"
              strokeColor={premiumMapPalette.routeStrokeMuted}
              strokeWidth={10}
            />
            <Polyline
              coordinates={routePreview.coordinates}
              lineCap="round"
              lineJoin="round"
              strokeColor={premiumMapPalette.routeStroke}
              strokeWidth={5}
            />
          </>
        ) : null}
      </MapView>

      <View style={styles.mapScrimTop} />
      <View style={styles.mapScrimBottom} />

      <SafeAreaView style={[styles.overlay, { pointerEvents: 'box-none' }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}>
            <Ionicons color="#FFFFFF" name="arrow-back" size={20} />
          </Pressable>

          <View style={styles.headerCopy}>
            <Text numberOfLines={1} style={styles.headerTitle}>
              Directions
            </Text>
            <Text numberOfLines={1} style={styles.headerSubtitle}>
              {event.venue}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handleRecenter}
            style={styles.recenterButton}>
            <Ionicons color="#FFFFFF" name="locate-outline" size={18} />
          </Pressable>
        </View>

        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.eventRow}>
            <Image contentFit="cover" source={{ uri: event.imageUrl }} style={styles.eventThumb} />
            <View style={styles.eventCopy}>
              <Text style={styles.sheetEyebrow}>{event.date}</Text>
              <Text numberOfLines={2} style={styles.sheetTitle}>
                {event.title}
              </Text>
              <Text numberOfLines={1} style={styles.sheetVenue}>
                {event.venueAddress}
              </Text>
            </View>
          </View>

          <View style={styles.metricRow}>
            <RouteMetric
              label="Distance"
              value={routePreview?.distanceLabel ?? '--'}
            />
            <RouteMetric
              label="ETA"
              value={routePreview?.durationLabel ?? '--'}
            />
            <RouteMetric
              label="Route"
              value={
                routePreview
                  ? routePreview.source === 'google'
                    ? 'Live'
                    : 'Approx.'
                  : 'Pending'
              }
            />
          </View>

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

          {routePreview?.steps.length ? (
            <ScrollView
              contentContainerStyle={styles.stepsWrap}
              showsVerticalScrollIndicator={false}
              style={styles.stepsScroll}>
              {routePreview.steps.map((step, index) => (
                <View key={`${step}-${index}`} style={styles.stepRow}>
                  <Text style={styles.stepIndex}>{`${index + 1}.`}</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.helperCard}>
              <Text style={styles.helperTitle}>
                {permissionStatus === 'denied'
                  ? 'Enable location to preview your route.'
                  : routePreview
                    ? 'Your route is ready.'
                    : 'Checking your route...'}
              </Text>
              <Text style={styles.helperBody}>
                {permissionStatus === 'denied'
                  ? 'You can still preview the venue here and fall back to external maps if needed.'
                  : 'The route stays in-app so users can pan, zoom, and recenter without leaving the event flow.'}
              </Text>
            </View>
          )}

          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => buildRoute(true)}
              style={styles.primaryButton}>
              {isRouting || isCheckingPermission || isLoadingLocation ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {routePreview ? 'Refresh Route' : 'Build Route'}
                </Text>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
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
      </SafeAreaView>
    </View>
  );
}

function RouteMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: premiumMapPalette.cardSurface,
    flex: 1,
  },
  noMapContent: {
    gap: ticketSpacing.md,
    paddingBottom: ticketSpacing.lg,
    paddingHorizontal: ticketSpacing.md,
    paddingTop: ticketSpacing.md,
  },
  noMapHero: {
    backgroundColor: premiumMapPalette.cardSurfaceElevated,
    borderColor: premiumMapPalette.cardBorder,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    gap: ticketSpacing.sm,
    padding: ticketSpacing.lg,
  },
  noMapHeroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  noMapHeroBody: {
    color: premiumMapPalette.textMuted,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  mapScrimTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 10, 18, 0.10)',
    height: 180,
  },
  mapScrimBottom: {
    backgroundColor: 'rgba(6, 10, 18, 0.24)',
    bottom: 0,
    height: 260,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: ticketSpacing.md,
    paddingHorizontal: ticketSpacing.md,
    paddingTop: ticketSpacing.sm,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(8, 13, 24, 0.74)',
    borderColor: premiumMapPalette.cardBorder,
    borderRadius: ticketRadii.pill,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  headerSubtitle: {
    color: premiumMapPalette.textMuted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
  },
  recenterButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(8, 13, 24, 0.74)',
    borderColor: premiumMapPalette.cardBorder,
    borderRadius: ticketRadii.pill,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  sheet: {
    backgroundColor: premiumMapPalette.cardSurface,
    borderColor: premiumMapPalette.cardBorder,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    gap: ticketSpacing.md,
    marginTop: ticketSpacing.xl,
    paddingBottom: ticketSpacing.lg,
    paddingHorizontal: ticketSpacing.md,
    paddingTop: ticketSpacing.sm,
  },
  noMapSheet: {
    marginTop: 0,
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(148, 163, 184, 0.36)',
    borderRadius: ticketRadii.pill,
    height: 4,
    width: 44,
  },
  eventRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: ticketSpacing.sm,
  },
  eventThumb: {
    borderRadius: ticketRadii.md,
    height: 72,
    width: 72,
  },
  eventCopy: {
    flex: 1,
    gap: 4,
  },
  sheetEyebrow: {
    color: premiumMapPalette.textSubtle,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
    textTransform: 'uppercase',
  },
  sheetTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 24,
  },
  sheetVenue: {
    color: premiumMapPalette.textMuted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  metricRow: {
    flexDirection: 'row',
    gap: ticketSpacing.sm,
  },
  metricCard: {
    backgroundColor: premiumMapPalette.cardSurfaceElevated,
    borderColor: premiumMapPalette.cardBorder,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    padding: ticketSpacing.sm,
  },
  metricLabel: {
    color: premiumMapPalette.textSubtle,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 19,
  },
  messageBanner: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(154, 103, 0, 0.14)',
    borderRadius: ticketRadii.md,
    flexDirection: 'row',
    gap: ticketSpacing.xs,
    paddingHorizontal: ticketSpacing.sm,
    paddingVertical: ticketSpacing.sm,
  },
  messageBannerText: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  helperCard: {
    backgroundColor: premiumMapPalette.cardSurfaceElevated,
    borderColor: premiumMapPalette.cardBorder,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    gap: ticketSpacing.xs,
    padding: ticketSpacing.sm,
  },
  helperTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  helperBody: {
    color: premiumMapPalette.textMuted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  stepsScroll: {
    maxHeight: 156,
  },
  stepsWrap: {
    gap: ticketSpacing.xs,
  },
  stepRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: ticketSpacing.xs,
  },
  stepIndex: {
    color: premiumMapPalette.routeStroke,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
  },
  stepText: {
    color: premiumMapPalette.textMuted,
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: ticketSpacing.sm,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: ticketColors.primary,
    borderRadius: ticketRadii.md,
    flex: 1.2,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: ticketSpacing.md,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: premiumMapPalette.cardSurfaceElevated,
    borderColor: premiumMapPalette.cardBorder,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: ticketSpacing.md,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
  inlineAction: {
    alignSelf: 'flex-start',
  },
  inlineActionText: {
    color: '#8BC0FF',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
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
  notFoundWrap: {
    flex: 1,
    gap: ticketSpacing.lg,
    justifyContent: 'center',
    paddingHorizontal: ticketSpacing.lg,
  },
  notFoundCard: {
    backgroundColor: premiumMapPalette.cardSurfaceElevated,
    borderColor: premiumMapPalette.cardBorder,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    gap: ticketSpacing.sm,
    padding: ticketSpacing.lg,
  },
  notFoundEyebrow: {
    color: '#8BC0FF',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  notFoundTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  notFoundBody: {
    color: premiumMapPalette.textMuted,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
  },
});
