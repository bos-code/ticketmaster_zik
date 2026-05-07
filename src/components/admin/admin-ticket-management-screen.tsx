import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { StatusBarChrome } from '@/components/status-bar-chrome';
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
      <StatusBarChrome style="dark" backgroundColor="#F5F6F8" />
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
              onPreview={(ticket) =>
                router.push({
                  pathname: '/admin/preview',
                  params: { ticketId: ticket.id },
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
              onPreview={(ticket) =>
                router.push({
                  pathname: '/admin/preview',
                  params: { ticketId: ticket.id },
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
  onPreview,
  tickets,
  title,
}: {
  onDelete: (ticket: TicketRecord) => void;
  onEdit: (ticket: TicketRecord) => void;
  onPreview: (ticket: TicketRecord) => void;
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
        <AdminTicketCard key={ticket.id} onDelete={() => onDelete(ticket)} onEdit={() => onEdit(ticket)} onPreview={() => onPreview(ticket)} ticket={ticket} />
      ))}
    </View>
  );
}

function AdminTicketCard({
  onDelete,
  onEdit,
  onPreview,
  ticket,
}: {
  onDelete: () => void;
  onEdit: () => void;
  onPreview: () => void;
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
          <Pressable onPress={onPreview} style={styles.previewButton}>
            <Ionicons color="#FFFFFF" name="eye-outline" size={16} />
            <Text style={styles.previewButtonText}>Preview</Text>
          </Pressable>
          <Pressable onPress={onEdit} style={styles.editButton}>
            <Ionicons color="#FFFFFF" name="create-outline" size={16} />
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
          <Pressable onPress={onDelete} style={styles.deleteButton}>
            <Ionicons color="#FF6B5A" name="trash-outline" size={16} />
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
  root: { backgroundColor: '#F5F6F8', flex: 1 },
  safe: { backgroundColor: '#F5F6F8' },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  eyebrow: { color: '#005BD3', fontSize: 10, fontWeight: '900', letterSpacing: 2.2, lineHeight: 13 },
  title: { color: '#111827', fontSize: 22, fontWeight: '900', lineHeight: 27, marginTop: 3 },
  subtitle: { color: '#6B7280', fontSize: 12, fontWeight: '600', lineHeight: 16, marginTop: 2 },
  countBadge: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 68,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  countNumber: { color: '#111827', fontSize: 20, fontWeight: '900', lineHeight: 23 },
  countLabel: { color: '#6B7280', fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  filterWrap: { borderBottomColor: '#E5E7EB', borderBottomWidth: 1, paddingBottom: 12 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterChipActive: { backgroundColor: '#005BD3', borderColor: '#005BD3' },
  filterText: { color: '#374151', fontSize: 12, fontWeight: '700' },
  filterTextActive: { color: '#FFFFFF' },
  content: { gap: 24, paddingHorizontal: 16, paddingTop: 20 },
  section: { gap: 10 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  sectionTitle: { color: '#374151', fontSize: 11, fontWeight: '900', letterSpacing: 1.3, textTransform: 'uppercase' },
  sectionCount: { color: '#9CA3AF', fontSize: 12, fontWeight: '700' },
  card: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: 10, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  artPanel: { height: 180, overflow: 'hidden' },
  cardImage: { backgroundColor: '#F3F4F6', height: '100%', width: '100%' },
  imageGradient: { bottom: 0, height: 80, left: 0, position: 'absolute', right: 0 },
  artAccent: { bottom: 0, height: 3, left: 0, position: 'absolute', right: 0 },
  badgeRow: { bottom: 12, flexDirection: 'row', gap: 6, left: 12, position: 'absolute' },
  badge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  goldBadge: { backgroundColor: '#92400E' },
  blueBadge: { backgroundColor: '#005BD3' },
  mutedBadge: { backgroundColor: '#6B7280' },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' },
  cardBody: { padding: 12 },
  cardTitle: { color: '#111827', fontSize: 17, fontWeight: '800', lineHeight: 22 },
  cardArtist: { color: '#6B7280', fontSize: 12, fontWeight: '600', lineHeight: 16, marginTop: 3 },
  divider: { backgroundColor: '#E5E7EB', height: 1, marginBottom: 10, marginTop: 10, width: '100%' },
  cardMeta: { color: '#374151', fontSize: 12, fontWeight: '600', lineHeight: 17 },
  cardDate: { color: '#111827', fontSize: 12, fontWeight: '700', lineHeight: 17, marginTop: 6 },
  seatGrid: { flexDirection: 'row', gap: 6, marginTop: 10 },
  seatFact: { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB', borderRadius: 6, borderWidth: 1, flex: 1, minHeight: 52, padding: 8 },
  seatLabel: { color: '#9CA3AF', fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  seatValue: { color: '#111827', fontSize: 12, fontWeight: '800', lineHeight: 16, marginTop: 3 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  editButton: {
    alignItems: 'center',
    backgroundColor: '#005BD3',
    borderRadius: 7,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 40,
  },
  editButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  previewButton: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderRadius: 7,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 40,
  },
  previewButtonText: { color: '#374151', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  deleteButton: {
    alignItems: 'center',
    borderColor: '#FCA5A5',
    borderRadius: 7,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 40,
    width: 40,
  },
  deleteButtonText: { color: '#EF4444', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  emptyTitle: { color: '#111827', fontSize: 16, fontWeight: '800', lineHeight: 21, textAlign: 'center' },
  emptyBody: { color: '#6B7280', fontSize: 13, fontWeight: '500', lineHeight: 18, textAlign: 'center' },
  fab: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#005BD3',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 7,
    minHeight: 50,
    paddingHorizontal: 20,
    position: 'absolute',
  },
  fabText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  toast: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#111827',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: 'absolute',
  },
  toastText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  sheetBackdrop: { backgroundColor: 'rgba(0,0,0,0.4)', flex: 1, justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  sheetHandle: { alignSelf: 'center', backgroundColor: '#D1D5DB', borderRadius: 999, height: 4, marginBottom: 18, width: 40 },
  sheetTitle: { color: '#111827', fontSize: 19, fontWeight: '800', lineHeight: 24 },
  sheetBody: { color: '#6B7280', fontSize: 14, fontWeight: '500', lineHeight: 20, marginTop: 8 },
  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  sheetCancel: {
    alignItems: 'center',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
  },
  sheetDelete: { alignItems: 'center', backgroundColor: '#DC2626', borderRadius: 8, flex: 1, justifyContent: 'center', minHeight: 46 },
  sheetCancelText: { color: '#374151', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  sheetDeleteText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
});
