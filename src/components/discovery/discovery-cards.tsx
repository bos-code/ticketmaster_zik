import { fonts } from '../../../theme/fonts';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Text as SvgText } from 'react-native-svg';
import { Text } from '@/components/ui/app-text';
import { HeartIcon } from '@/components/heart-icon';
import { fanColors as C } from '@/constants/fan-theme';
import { useFanStore } from '@/store/use-fan-store';
import { discoveryImage, eventDateParts, type DiscoveryEvent } from './discovery-data';

export function useOpenDiscoveryEvent() {
  const router = useRouter();
  return (event: DiscoveryEvent) => router.push({ pathname: '/events/[id]', params: { id: event.id } });
}

export function EventTile({ event, width = 244, onMenu }: { event: DiscoveryEvent; width?: number; onMenu?: () => void }) {
  const openEvent = useOpenDiscoveryEvent();
  const date = eventDateParts(event.date);
  return (
    <View style={[styles.tile, { width }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={`View ${event.title}`} onPress={() => openEvent(event)}>
        <Image source={discoveryImage(event.image)} contentFit="cover" style={{ width, height: width * 0.56 }} />
        <View style={styles.titleFlag}><Text style={styles.tileTitle} numberOfLines={1}>{event.title.toUpperCase()}</Text></View>
      </Pressable>
      <View style={styles.eventMeta}>
        <Pressable accessibilityRole="button" onPress={() => openEvent(event)} style={styles.date}>
          <Text style={styles.month}>{date.month}</Text><Text style={styles.day}>{date.day}</Text><View style={styles.dateRule} />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => openEvent(event)} style={styles.metaCopy}>
          <Text numberOfLines={1} style={styles.time}>{date.weekday} · {event.time}</Text>
          <View style={styles.venueRow}><Ionicons name="location" size={11} color={C.teal} /><Text numberOfLines={1} style={styles.venue}>{event.city} - {event.venue}</Text></View>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Options for ${event.title}`} onPress={onMenu ?? (() => openEvent(event))} hitSlop={8} style={styles.more}><Ionicons name="ellipsis-vertical" size={19} color="white" /></Pressable>
      </View>
    </View>
  );
}

export function ArtistRow({ event, rank, width }: { event: DiscoveryEvent; rank?: number; width?: number }) {
  const favourites = useFanStore((state) => state.favouriteArtistIds);
  const toggleFavourite = useFanStore((state) => state.toggleFavouriteArtist);
  const openEvent = useOpenDiscoveryEvent();
  const favourite = favourites.includes(event.id);
  return (
    <View style={[styles.artistWrap, width ? { width } : undefined]}>
      {rank !== undefined && <Svg width={37} height={45} style={styles.rank}><SvgText x={0} y={34} fontSize={29} fontFamily={Platform.OS === 'web' ? 'Averta' : fonts.regular} fill="none" stroke={C.yellow} strokeWidth={0.8}>{String(rank).padStart(2, '0')}</SvgText></Svg>}
      <View style={[styles.artist, { marginLeft: rank !== undefined ? 23 : 0 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${rank !== undefined ? `${String(rank).padStart(2, '0')}. ` : ''}View ${event.artist}`} onPress={() => openEvent(event)} style={styles.artistInfo}>
          <Image source={discoveryImage(event.image)} contentFit="cover" style={styles.artistImage} />
          <View style={styles.artistCopy}><Text numberOfLines={1} style={styles.artistName}>{event.artist}</Text><View style={styles.genreRow}><Ionicons name={event.category === 'sports' ? 'trophy-outline' : event.category === 'arts' ? 'mic-outline' : 'musical-notes-outline'} size={13} color={C.muted} /><Text numberOfLines={1} style={styles.genre}>{event.genre}</Text></View></View>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityState={{ selected: favourite }} accessibilityLabel={`${favourite ? 'Remove' : 'Add'} ${event.artist} ${favourite ? 'from' : 'to'} favourites`} onPress={() => toggleFavourite(event.id)} style={styles.heart}>
          <HeartIcon size={21} color={favourite ? C.purple : '#FFFFFF'} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { backgroundColor: C.surface, overflow: 'hidden' },
  titleFlag: { position: 'absolute', bottom: 0, left: 0, maxWidth: '100%', backgroundColor: C.surface, paddingHorizontal: 8, paddingVertical: 8 },
  tileTitle: { color: 'white', fontSize: 16, fontWeight: '800', lineHeight: 22 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', minHeight: 68, paddingHorizontal: 8, paddingVertical: 7, gap: 10 },
  date: { width: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }, month: { color: 'white', fontSize: 11, fontWeight: '700' },
  day: { color: 'white', fontSize: 20, lineHeight: 23, fontWeight: '800' }, dateRule: { width: 17, height: 2, backgroundColor: '#9B3E4D', marginTop: 3 },
  metaCopy: { flex: 1, minWidth: 0, minHeight: 44, justifyContent: 'center', gap: 4 }, time: { color: '#CFCFCF', fontSize: 13 }, venueRow: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  venue: { color: 'white', fontSize: 13, fontWeight: '600', flex: 1 }, more: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  artistWrap: { position: 'relative' }, rank: { position: 'absolute', left: 0, top: 6, zIndex: 1 },
  artist: { minHeight: 76, borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center' },
  artistInfo: { flexDirection: 'row', flex: 1, minWidth: 0, minHeight: 76, alignItems: 'center' }, artistImage: { width: 84, height: 76 },
  artistCopy: { flex: 1, minWidth: 0, paddingHorizontal: 10, gap: 3 }, artistName: { color: 'white', fontSize: 15, lineHeight: 21, fontWeight: '700' }, genreRow: { flexDirection: 'row', gap: 4, alignItems: 'center' }, genre: { color: C.muted, fontSize: 13, flexShrink: 1 },
  heart: { width: 44, minHeight: 76, alignItems: 'center', justifyContent: 'center' },
});
