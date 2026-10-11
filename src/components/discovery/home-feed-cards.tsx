import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/app-text';
import { HeartIcon } from '@/components/heart-icon';
import { fanColors as C } from '@/constants/fan-theme';
import { useFanStore } from '@/store/use-fan-store';
import { discoveryImage, eventDateParts, type DiscoveryEvent } from './discovery-data';
import { useOpenDiscoveryEvent } from './discovery-cards';

export function FeedEventCard({ event, width, promo = false, onMenu }: {
  event: DiscoveryEvent; width: number; promo?: boolean; onMenu: () => void;
}) {
  const open = useOpenDiscoveryEvent();
  const date = eventDateParts(event.date);
  const presaleDate = event.presale ? new Date(event.presale.opensAt) : null;
  const presaleLabel = presaleDate && !Number.isNaN(presaleDate.getTime())
    ? presaleDate.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : null;
  return <View style={[styles.card, { width }, promo && styles.promo]}>
    <Pressable accessibilityRole="button" accessibilityLabel={`View ${event.title}${event.sample ? ', sample event' : ''}`} onPress={() => open(event)}>
      <Image source={discoveryImage(event.image)} contentFit="cover" style={{ width, height: width * 0.59 }} />
      <View style={styles.dateTab}><Text style={styles.date}>{date.weekday.slice(0, 3)} {date.day} {date.month}</Text></View>
    </Pressable>
    <View style={styles.titleRow}><Pressable accessibilityRole="button" onPress={() => open(event)} style={styles.titleButton}><Text numberOfLines={1} style={styles.title}>{event.title.toUpperCase()}</Text>{promo && <View style={styles.accent} />}</Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Options for ${event.title}`} onPress={onMenu} style={styles.more}><Ionicons name="ellipsis-vertical" size={18} color="white" /></Pressable></View>
    <Pressable accessibilityRole="button" onPress={() => open(event)} style={styles.subtitleButton}><Text numberOfLines={1} style={styles.subtitle}>{event.time} · {promo ? event.city : event.venue}</Text></Pressable>
    {promo && <Pressable accessibilityRole="button" accessibilityLabel={`View ${event.presale ? 'presale details' : 'details'} for ${event.title}`} onPress={() => open(event)} style={styles.footer}>
      {event.presale?.sponsor && <View style={styles.sponsor}><Text style={styles.sponsorText}>P</Text></View>}
      <Text numberOfLines={2} style={styles.footerLabel}>{event.presale?.sponsor && presaleLabel ? presaleLabel : event.presale ? 'View Presales' : 'View Event'}</Text><Ionicons name="chevron-forward" size={21} color="white" />
    </Pressable>}
  </View>;
}

export function ArtistTile({ event, events, width, subtitle, onOpen, showHeart = true }: {
  event: DiscoveryEvent; events: DiscoveryEvent[]; width: number; subtitle?: string; onOpen: () => void; showHeart?: boolean;
}) {
  const favourites = useFanStore((state) => state.favouriteArtistIds);
  const toggle = useFanStore((state) => state.toggleFavouriteArtist);
  const selected = events.every((item) => favourites.includes(item.id));
  function toggleGroup() {
    for (const item of events) if (selected || !favourites.includes(item.id)) toggle(item.id);
  }
  return <View style={{ width }}>
    <View><Pressable accessibilityRole="button" accessibilityLabel={`Explore ${event.artist}`} onPress={onOpen}><Image source={discoveryImage(event.image)} contentFit="cover" style={{ width, height: width * 0.59 }} /></Pressable>
      {showHeart && <Pressable accessibilityRole="button" accessibilityLabel={`${selected ? 'Remove' : 'Add'} ${event.artist} ${selected ? 'from' : 'to'} favourites`} accessibilityState={{ selected }} onPress={toggleGroup} style={styles.favourite}><HeartIcon size={25} color={selected ? C.purple : 'white'} /></Pressable>}
    </View>
    <Pressable accessibilityRole="button" onPress={onOpen} style={styles.artistCopy}><Text numberOfLines={1} style={styles.title}>{event.artist.toUpperCase()}</Text><Text numberOfLines={2} style={styles.subtitle}>{subtitle ?? `${events.length} ${events.length === 1 ? 'event' : 'events'}`}</Text></Pressable>
  </View>;
}

export function CityGuideCard({ city, image, width, onOpen }: {
  city: string; image: DiscoveryEvent['image']; width: number; onOpen: () => void;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Explore events in ${city}`} onPress={onOpen} style={{ width }}><Image source={discoveryImage(image)} contentFit="cover" style={{ width, height: width * 1.8 }} /><View style={styles.cityTab}><Text numberOfLines={1} style={styles.title}>{city.split(',')[0].toUpperCase()}</Text></View></Pressable>;
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden' }, promo: { backgroundColor: C.surface },
  dateTab: { position: 'absolute', bottom: 0, left: 0, backgroundColor: C.background, padding: 8 }, date: { fontSize: 12, color: 'white' },
  titleRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 8 }, titleButton: { flex: 1, minWidth: 0, minHeight: 44, justifyContent: 'center' },
  title: { fontSize: 14, lineHeight: 20, fontWeight: '800', color: 'white' }, more: { width: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }, accent: { height: 2, marginTop: 4, backgroundColor: '#9B3E4D' },
  subtitleButton: { paddingHorizontal: 8, paddingBottom: 14, minHeight: 44 }, subtitle: { color: C.muted, fontSize: 12, lineHeight: 18 },
  footer: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#0D0D0D', paddingHorizontal: 10, minHeight: 48 }, footerLabel: { flex: 1, minWidth: 0, color: 'white', fontWeight: '700', fontSize: 12, lineHeight: 18 },
  sponsor: { width: 23, height: 23, borderRadius: 12, backgroundColor: C.blue, justifyContent: 'center', alignItems: 'center' }, sponsorText: { color: 'white', fontSize: 12, fontWeight: '700' },
  favourite: { position: 'absolute', top: 0, right: 0, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,.65)' },
  artistCopy: { minHeight: 65, gap: 4, paddingTop: 8, paddingHorizontal: 8 }, cityTab: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.background, padding: 8 },
});
