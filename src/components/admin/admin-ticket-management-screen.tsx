import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  formatTicketDate,
  type TicketRecord,
  type TicketType,
  useTicketStore,
} from '@/store/ticketStore';

type TicketFilter = 'All' | 'Upcoming' | TicketType | 'Past';

const filters: TicketFilter[] = ['All', 'Upcoming', 'VIP', 'Standard', 'General', 'Past'];

export function AdminTicketManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ toast?: string }>();
  const tickets = useTicketStore((state) => state.tickets);
  const removeEvent = useTicketStore((state) => state.removeEvent);
  const [activeFilter, setActiveFilter] = useState<TicketFilter>('All');
  const [deleteTarget, setDeleteTarget] = useState<TicketRecord | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (params.toast === 'created') {
      showToast('Ticket created');
    }

    if (params.toast === 'updated') {
      showToast('Ticket updated');
    }
  }, [params.toast]);

  const visibleTickets = useMemo(
    () =>
      tickets.filter((ticket) => {
        if (activeFilter === 'All') {
          return true;
        }

        if (activeFilter === 'Upcoming') {
          return ticket.status === 'upcoming';
        }

        if (activeFilter === 'Past') {
          return ticket.status === 'past';
        }

        return ticket.ticketType === activeFilter;
      }),
    [activeFilter, tickets],
  );

  const upcomingTickets = visibleTickets.filter((ticket) => ticket.status === 'upcoming');
  const pastTickets = visibleTickets.filter((ticket) => ticket.status === 'past');

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 1800);
  }

  function handleConfirmDelete() {
    if (!deleteTarget) {
      return;
    }

    removeEvent(deleteTarget.id);
    setDeleteTarget(null);
    showToast('Ticket deleted');
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor="#050505" />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>STARBOY ADMIN</Text>
            <Text style={styles.title}>Ticket Management</Text>
            <Text style={styles.subtitle}>Wizkid: Made in Lagos Live mock database</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countNumber}>{tickets.length}</Text>
            <Text style={styles.countLabel}>Tickets</Text>
          </View>
        </View>

        <View style={styles.filterWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {filters.map((filter) => {
                const active = activeFilter === filter;

                return (
                  <Pressable
                    key={filter}
                    onPress={() => setActiveFilter(filter)}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterText, active && styles.filterTextActive]}>
                      {filter}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 112 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {visibleTickets.length ? (
          <>
            <TicketSection
              onDelete={setDeleteTarget}
              onEdit={(ticket) =>
                router.push({
                  pathname: '/add-event',
                  params: { mode: 'edit', ticketId: ticket.id },
                })
              }
              tickets={upcomingTickets}
              title="Upcoming"
            />
            <TicketSection
              onDelete={setDeleteTarget}
              onEdit={(ticket) =>
                router.push({
                  pathname: '/add-event',
                  params: { mode: 'edit', ticketId: ticket.id },
                })
              }
              tickets={pastTickets}
              title="Past"
            />
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons color="#B79E6A" name="ticket-outline" size={34} />
            <Text style={styles.emptyTitle}>No tickets match this filter</Text>
            <Text style={styles.emptyBody}>Try another ticket type or create a new Wizkid ticket.</Text>
          </View>
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.push({ pathname: '/add-event', params: { mode: 'create' } })}
        style={[styles.fab, { bottom: Math.max(insets.bottom, 18) + 12 }]}
      >
        <Ionicons color="#FFFFFF" name="add" size={20} />
        <Text style={styles.fabText}>New Ticket</Text>
      </Pressable>

      <DeleteSheet
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        ticket={deleteTarget}
      />

      {toast ? (
        <View style={[styles.toast, { bottom: Math.max(insets.bottom, 18) + 78 }]}>
          <Ionicons color="#FFFFFF" name="checkmark-circle" size={16} />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </View>
  );
}

function TicketSection({
  onDelete,
  onEdit,
  tickets,
  title,
}: {
  onDelete: (ticket: TicketRecord) => void;
  onEdit: (ticket: TicketRecord) => void;
  tickets: TicketRecord[];
  title: string;
}) {
  if (!tickets.length) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCount}>{tickets.length}</Text>
      </View>
      {tickets.map((ticket) => (
        <AdminTicketCard key={ticket.id} onDelete={() => onDelete(ticket)} onEdit={() => onEdit(ticket)} ticket={ticket} />
      ))}
    </View>
  );
}

function AdminTicketCard({
  onDelete,
  onEdit,
  ticket,
}: {
  onDelete: () => void;
  onEdit: () => void;
  ticket: TicketRecord;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.artPanel}>
        <Image contentFit="cover" source={{ uri: ticket.image }} style={styles.cardImage} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.82)']} style={styles.imageGradient} />
        <View style={[styles.artAccent, { backgroundColor: ticket.backgroundColor }]} />
        <View style={styles.badgeRow}>
          <Badge label={ticket.ticketType} tone="gold" />
          <Badge label={ticket.status} tone={ticket.status === 'upcoming' ? 'blue' : 'muted'} />
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{ticket.eventName}</Text>
        <Text style={styles.cardArtist}>{ticket.artistName} / {ticket.albumName}</Text>
        <View style={styles.divider} />
        <Text style={styles.cardMeta}>{ticket.venue}</Text>
        <Text style={styles.cardMeta}>{ticket.city}, {ticket.state}, {ticket.country}</Text>
        <Text style={styles.cardDate}>{formatTicketDate(ticket)}</Text>

        <View style={styles.seatGrid}>
          <SeatFact label="Section" value={ticket.section} />
          <SeatFact label="Row" value={ticket.row} />
          <SeatFact label="Seats" value={ticket.seatRange} />
        </View>

        <View style={styles.actionRow}>
          <Pressable onPress={onEdit} style={styles.editButton}>
            <Ionicons color="#FFFFFF" name="create-outline" size={16} />
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
          <Pressable onPress={onDelete} style={styles.deleteButton}>
            <Ionicons color="#FF6B5A" name="trash-outline" size={16} />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function Badge({ label, tone }: { label: string; tone: 'blue' | 'gold' | 'muted' }) {
  return (
    <View style={[styles.badge, styles[`${tone}Badge`]]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

function SeatFact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.seatFact}>
      <Text style={styles.seatLabel}>{label}</Text>
      <Text style={styles.seatValue}>{value}</Text>
    </View>
  );
}

function DeleteSheet({
  onCancel,
  onConfirm,
  ticket,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  ticket: TicketRecord | null;
}) {
  return (
    <Modal animationType="slide" onRequestClose={onCancel} transparent visible={Boolean(ticket)}>
      <View style={styles.sheetBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Delete ticket?</Text>
          <Text style={styles.sheetBody}>
            This will remove {ticket?.eventName ?? 'this ticket'} from Admin and My Tickets immediately.
          </Text>
          <View style={styles.sheetActions}>
            <Pressable onPress={onCancel} style={styles.sheetCancel}>
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={styles.sheetDelete}>
              <Text style={styles.sheetDeleteText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#050505', flex: 1 },
  safe: { backgroundColor: '#050505' },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 18,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  eyebrow: { color: '#B79E6A', fontSize: 10, fontWeight: '900', letterSpacing: 2.2, lineHeight: 13 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', lineHeight: 29, marginTop: 3 },
  subtitle: { color: 'rgba(255,255,255,0.58)', fontSize: 12, fontWeight: '700', lineHeight: 16, marginTop: 3 },
  countBadge: {
    alignItems: 'center',
    backgroundColor: '#101010',
    borderColor: 'rgba(183,158,106,0.45)',
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 72,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  countNumber: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', lineHeight: 23 },
  countLabel: { color: '#B79E6A', fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  filterWrap: { borderBottomColor: 'rgba(255,255,255,0.08)', borderBottomWidth: 1, paddingBottom: 12 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  filterChip: {
    backgroundColor: '#101010',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  filterChipActive: { backgroundColor: '#B79E6A', borderColor: '#B79E6A' },
  filterText: { color: 'rgba(255,255,255,0.68)', fontSize: 12, fontWeight: '900' },
  filterTextActive: { color: '#050505' },
  content: { gap: 24, paddingHorizontal: 16, paddingTop: 20 },
  section: { gap: 13 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  sectionTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '900', letterSpacing: 1.3, textTransform: 'uppercase' },
  sectionCount: { color: '#B79E6A', fontSize: 13, fontWeight: '900' },
  card: { backgroundColor: '#101010', borderRadius: 8, marginBottom: 14, overflow: 'hidden' },
  artPanel: { height: 164, overflow: 'hidden' },
  cardImage: { backgroundColor: '#1A1A1A', height: '100%', width: '100%' },
  imageGradient: { bottom: 0, height: 90, left: 0, position: 'absolute', right: 0 },
  artAccent: { bottom: 0, height: 4, left: 0, position: 'absolute', right: 0 },
  badgeRow: { bottom: 14, flexDirection: 'row', gap: 8, left: 14, position: 'absolute' },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  goldBadge: { backgroundColor: '#B79E6A' },
  blueBadge: { backgroundColor: '#005BD3' },
  mutedBadge: { backgroundColor: '#333333' },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  cardBody: { padding: 14 },
  cardTitle: { color: '#FFFFFF', fontSize: 21, fontWeight: '900', lineHeight: 25 },
  cardArtist: { color: '#B79E6A', fontSize: 12, fontWeight: '900', lineHeight: 16, marginTop: 4 },
  divider: { backgroundColor: '#B79E6A', height: 3, marginBottom: 12, marginTop: 12, width: 112 },
  cardMeta: { color: 'rgba(255,255,255,0.78)', fontSize: 13, fontWeight: '700', lineHeight: 18 },
  cardDate: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', lineHeight: 18, marginTop: 8 },
  seatGrid: { flexDirection: 'row', gap: 8, marginTop: 13 },
  seatFact: { backgroundColor: '#181818', borderRadius: 8, flex: 1, minHeight: 58, padding: 9 },
  seatLabel: { color: 'rgba(255,255,255,0.42)', fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  seatValue: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', lineHeight: 16, marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  editButton: {
    alignItems: 'center',
    backgroundColor: '#005BD3',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 44,
  },
  editButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  deleteButton: {
    alignItems: 'center',
    borderColor: 'rgba(255,107,90,0.35)',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 44,
  },
  deleteButtonText: { color: '#FF6B5A', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#101010',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 34,
  },
  emptyTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', lineHeight: 22, textAlign: 'center' },
  emptyBody: { color: 'rgba(255,255,255,0.62)', fontSize: 13, fontWeight: '700', lineHeight: 18, textAlign: 'center' },
  fab: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#005BD3',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 7,
    minHeight: 52,
    paddingHorizontal: 20,
    position: 'absolute',
  },
  fabText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  toast: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#151515',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: 'absolute',
  },
  toastText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  sheetBackdrop: { backgroundColor: 'rgba(0,0,0,0.72)', flex: 1, justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#101010', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  sheetHandle: { alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 999, height: 4, marginBottom: 18, width: 42 },
  sheetTitle: { color: '#FFFFFF', fontSize: 21, fontWeight: '900', lineHeight: 25 },
  sheetBody: { color: 'rgba(255,255,255,0.66)', fontSize: 14, fontWeight: '700', lineHeight: 20, marginTop: 8 },
  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  sheetCancel: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  sheetDelete: { alignItems: 'center', backgroundColor: '#B42318', borderRadius: 8, flex: 1, justifyContent: 'center', minHeight: 48 },
  sheetCancelText: { color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  sheetDeleteText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
});
