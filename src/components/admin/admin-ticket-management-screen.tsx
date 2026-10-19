import { LAYER_MODAL } from '@/constants/layers';
import { useOverlaySlot } from '@/lib/overlay-manager';
import { Text } from '@/components/ui/app-text';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '@/components/ui/screen-wrapper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { createAdminStyles, useAdminTheme, type AdminThemePreference } from '@/components/admin/admin-theme';
import {
  formatTicketDate,
  type TicketRecord,
  type TicketType,
  useTicketStore,
} from '@/store/ticketStore';

type TicketFilter = 'All' | 'Upcoming' | TicketType | 'Past' | 'Hidden';

const filters: TicketFilter[] = ['All', 'Upcoming', 'VIP', 'Standard', 'General', 'Past', 'Hidden'];

const themeLabels: Record<AdminThemePreference, string> = {
  system: 'Auto (phone setting)',
  dark: 'Dark',
  light: 'Light',
};

const themeIcons: Record<AdminThemePreference, React.ComponentProps<typeof Ionicons>['name']> = {
  system: 'contrast-outline',
  dark: 'moon',
  light: 'sunny',
};

// Same order as cyclePreference: System -> Dark -> Light -> System.
const nextThemePreference: Record<AdminThemePreference, AdminThemePreference> = {
  system: 'dark',
  dark: 'light',
  light: 'system',
};

export function AdminTicketManagementScreen() {
  const router = useRouter();
  const styles = useStyles();
  const { colors, scheme, preference, cyclePreference } = useAdminTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ toast?: string }>();
  const tickets = useTicketStore((state) => state.tickets);
  const removeEvent = useTicketStore((state) => state.removeEvent);
  const updateEvent = useTicketStore((state) => state.updateEvent);
  const [visibilityUpdatingId, setVisibilityUpdatingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<TicketFilter>('All');
  const [deleteTarget, setDeleteTarget] = useState<TicketRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

        if (activeFilter === 'Hidden') {
          return Boolean(ticket.isHidden);
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

  async function handleToggleHidden(ticket: TicketRecord) {
    if (visibilityUpdatingId) {
      return;
    }

    const nextHidden = !ticket.isHidden;

    try {
      setVisibilityUpdatingId(ticket.id);
      await updateEvent(ticket.id, { isHidden: nextHidden });
      showToast(nextHidden ? 'Ticket hidden from users' : 'Ticket visible to users');
    } catch {
      Alert.alert(
        'Update failed',
        'We could not change this ticket\'s visibility right now. Please try again.',
      );
    } finally {
      setVisibilityUpdatingId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget || isDeleting) {
      return;
    }

    try {
      setIsDeleting(true);
      await removeEvent(deleteTarget.id);
      setDeleteTarget(null);
      showToast('Ticket deleted');
    } catch {
      Alert.alert(
        'Delete failed',
        'We could not remove this ticket from Firebase right now. Please try again.',
      );
    } finally {
      setIsDeleting(false);
    }
  }

  function handleExitAdmin() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/my-tickets');
  }

  function handleCycleTheme() {
    cyclePreference();
    showToast(`Theme: ${themeLabels[nextThemePreference[preference]]}`);
  }

  return (
    <ScreenWrapper backgroundColor={colors.background}>
      <Head>
        <meta name="theme-color" content={colors.background} />
        <meta name="color-scheme" content={scheme} />
      </Head>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} backgroundColor={colors.background} />
      <View style={styles.header}>
          <View style={styles.headerButtons}>
            <Pressable onPress={handleExitAdmin} style={styles.iconButton}>
              <Ionicons color={colors.textSecondary} name="chevron-back" size={20} />
            </Pressable>
            <Pressable
              accessibilityLabel={`Theme: ${themeLabels[preference]}`}
              accessibilityRole="button"
              onPress={handleCycleTheme}
              style={styles.iconButton}
            >
              <Ionicons color={colors.textSecondary} name={themeIcons[preference]} size={20} />
            </Pressable>
          </View>
          <View style={styles.headerCopy}>
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

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 240 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {visibleTickets.length ? (
          <>
            <TicketSection
              onDelete={setDeleteTarget}
              onToggleHidden={handleToggleHidden}
              visibilityUpdatingId={visibilityUpdatingId}
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
              onToggleHidden={handleToggleHidden}
              visibilityUpdatingId={visibilityUpdatingId}
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
            <Ionicons color={colors.accent} name="ticket-outline" size={34} />
            <Text style={styles.emptyTitle}>No tickets match this filter</Text>
            <Text style={styles.emptyBody}>Try another ticket type or create a new Wizkid ticket.</Text>
          </View>
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.push('/admin/ticketmaster')}
        style={[styles.fab, styles.fabSecondary, { bottom: Math.max(insets.bottom, 18) + 12 + 56 }]}
      >
        <Ionicons color={colors.onInverse} name="search" size={20} />
        <Text style={[styles.fabText, styles.fabSecondaryText]}>From Ticketmaster</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push({ pathname: '/add-event', params: { mode: 'create' } })}
        style={[styles.fab, { bottom: Math.max(insets.bottom, 18) + 12 }]}
      >
        <Ionicons color={colors.onPrimary} name="add" size={20} />
        <Text style={styles.fabText}>New Ticket</Text>
      </Pressable>

      <DeleteSheet
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
        isDeleting={isDeleting}
        ticket={deleteTarget}
      />

      {toast ? (
        <View style={[styles.toast, { bottom: Math.max(insets.bottom, 18) + 78 }]}>
          <Ionicons color={colors.onToast} name="checkmark-circle" size={16} />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </ScreenWrapper>
  );
}

function TicketSection({
  onDelete,
  onEdit,
  onPreview,
  onToggleHidden,
  tickets,
  title,
  visibilityUpdatingId,
}: {
  onDelete: (ticket: TicketRecord) => void;
  onEdit: (ticket: TicketRecord) => void;
  onPreview: (ticket: TicketRecord) => void;
  onToggleHidden: (ticket: TicketRecord) => void;
  tickets: TicketRecord[];
  title: string;
  visibilityUpdatingId: string | null;
}) {
  const styles = useStyles();

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
        <AdminTicketCard key={ticket.id} isUpdatingVisibility={visibilityUpdatingId === ticket.id} onDelete={() => onDelete(ticket)} onEdit={() => onEdit(ticket)} onPreview={() => onPreview(ticket)} onToggleHidden={() => onToggleHidden(ticket)} ticket={ticket} />
      ))}
    </View>
  );
}

function AdminTicketCard({
  isUpdatingVisibility,
  onDelete,
  onEdit,
  onPreview,
  onToggleHidden,
  ticket,
}: {
  isUpdatingVisibility: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onPreview: () => void;
  onToggleHidden: () => void;
  ticket: TicketRecord;
}) {
  const styles = useStyles();
  const { colors } = useAdminTheme();

  return (
    <View style={styles.card}>
      <View style={[styles.artPanel, ticket.isHidden && styles.hiddenContent]}>
        <Image contentFit="cover" source={{ uri: ticket.image }} style={styles.cardImage} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.82)']} style={styles.imageGradient} />
        <View style={[styles.artAccent, { backgroundColor: ticket.backgroundColor }]} />
        <View style={styles.badgeRow}>
          <Badge label={ticket.ticketType} tone="gold" />
          <Badge label={ticket.status} tone={ticket.status === 'upcoming' ? 'blue' : 'muted'} />
        </View>
      </View>
      <Pressable
        accessibilityLabel={ticket.isHidden ? 'Hidden from users. Tap to show this ticket.' : 'Visible to users. Tap to hide this ticket.'}
        accessibilityRole="switch"
        accessibilityState={{ checked: !ticket.isHidden, disabled: isUpdatingVisibility }}
        disabled={isUpdatingVisibility}
        hitSlop={8}
        onPress={onToggleHidden}
        style={[styles.visibilityToggle, ticket.isHidden ? styles.visibilityToggleHidden : styles.visibilityToggleVisible]}
      >
        {isUpdatingVisibility ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Ionicons color="#FFFFFF" name={ticket.isHidden ? 'eye-off-outline' : 'eye-outline'} size={16} />
        )}
        <Text style={styles.visibilityToggleText}>{ticket.isHidden ? 'Hidden' : 'Visible'}</Text>
      </Pressable>

      <View style={styles.cardBody}>
        <View style={ticket.isHidden ? styles.hiddenContent : undefined}>
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
        </View>

        <View style={styles.actionRow}>
          <Pressable onPress={onPreview} style={styles.previewButton}>
            <Ionicons color={colors.textSecondary} name="eye-outline" size={16} />
            <Text style={styles.previewButtonText}>Preview</Text>
          </Pressable>
          <Pressable onPress={onEdit} style={styles.editButton}>
            <Ionicons color={colors.onPrimary} name="create-outline" size={16} />
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
          <Pressable onPress={onDelete} style={styles.deleteButton}>
            <Ionicons color={colors.danger} name="trash-outline" size={16} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function Badge({ label, tone }: { label: string; tone: 'blue' | 'gold' | 'muted' }) {
  const styles = useStyles();

  return (
    <View style={[styles.badge, styles[`${tone}Badge`]]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

function SeatFact({ label, value }: { label: string; value: string }) {
  const styles = useStyles();

  return (
    <View style={styles.seatFact}>
      <Text style={styles.seatLabel}>{label}</Text>
      <Text style={styles.seatValue}>{value}</Text>
    </View>
  );
}

function DeleteSheet({
  isDeleting,
  onCancel,
  onConfirm,
  ticket,
}: {
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  ticket: TicketRecord | null;
}) {
  const styles = useStyles();
  const { colors } = useAdminTheme();
  const isShown = useOverlaySlot('modal', Boolean(ticket));

  return (
    <Modal animationType="slide" onRequestClose={onCancel} transparent visible={isShown}>
      <View style={[styles.sheetBackdrop, { zIndex: LAYER_MODAL }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Delete ticket?</Text>
          <Text style={styles.sheetBody}>
            This will remove {ticket?.eventName ?? 'this ticket'} from Admin and My Tickets immediately.
          </Text>
          <View style={styles.sheetActions}>
            <Pressable disabled={isDeleting} onPress={onCancel} style={styles.sheetCancel}>
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              disabled={isDeleting}
              onPress={onConfirm}
              style={[styles.sheetDelete, isDeleting && styles.sheetDeleteDisabled]}
            >
              {isDeleting ? (
                <ActivityIndicator color={colors.onPrimary} size="small" />
              ) : (
                <Text style={styles.sheetDeleteText}>Delete</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const useStyles = createAdminStyles((c) => ({
  root: { backgroundColor: c.background, flex: 1 },
  safe: { backgroundColor: c.background },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerButtons: { gap: 8 },
  iconButton: {
    alignItems: 'center',
    backgroundColor: c.surface,
    borderColor: c.border,
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerCopy: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  eyebrow: { color: c.primaryText, fontSize: 10, fontWeight: '900', letterSpacing: 2.2, lineHeight: 13 },
  title: { color: c.text, fontSize: 22, fontWeight: '900', lineHeight: 27, marginTop: 3 },
  subtitle: { color: c.textMuted, fontSize: 12, fontWeight: '600', lineHeight: 16, marginTop: 2 },
  countBadge: {
    alignItems: 'center',
    backgroundColor: c.surface,
    borderColor: c.border,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 68,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  countNumber: { color: c.text, fontSize: 20, fontWeight: '900', lineHeight: 23 },
  countLabel: { color: c.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  filterWrap: { borderBottomColor: c.border, borderBottomWidth: 1, paddingBottom: 12 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  filterChip: {
    backgroundColor: c.surface,
    borderColor: c.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterChipActive: { backgroundColor: c.primary, borderColor: c.primary },
  filterText: { color: c.textSecondary, fontSize: 12, fontWeight: '700' },
  filterTextActive: { color: c.onPrimary },
  content: { gap: 24, paddingHorizontal: 16, paddingTop: 20 },
  section: { gap: 10 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  sectionTitle: { color: c.textSecondary, fontSize: 11, fontWeight: '900', letterSpacing: 1.3, textTransform: 'uppercase' },
  sectionCount: { color: c.textSubtle, fontSize: 12, fontWeight: '700' },
  card: { backgroundColor: c.surface, borderColor: c.border, borderRadius: 10, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  artPanel: { height: 180, overflow: 'hidden' },
  cardImage: { backgroundColor: c.surfaceStrong, height: '100%', width: '100%' },
  imageGradient: { bottom: 0, height: 80, left: 0, position: 'absolute', right: 0 },
  artAccent: { bottom: 0, height: 3, left: 0, position: 'absolute', right: 0 },
  badgeRow: { bottom: 12, flexDirection: 'row', gap: 6, left: 12, position: 'absolute' },
  badge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  // Badges sit on the ticket art, so they keep fixed colours in both schemes.
  goldBadge: { backgroundColor: '#92400E' },
  blueBadge: { backgroundColor: '#005BD3' },
  mutedBadge: { backgroundColor: '#6B7280' },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' },
  cardBody: { padding: 12 },
  cardTitle: { color: c.text, fontSize: 17, fontWeight: '800', lineHeight: 22 },
  cardArtist: { color: c.textMuted, fontSize: 12, fontWeight: '600', lineHeight: 16, marginTop: 3 },
  divider: { backgroundColor: c.border, height: 1, marginBottom: 10, marginTop: 10, width: '100%' },
  cardMeta: { color: c.textSecondary, fontSize: 12, fontWeight: '600', lineHeight: 17 },
  cardDate: { color: c.text, fontSize: 12, fontWeight: '700', lineHeight: 17, marginTop: 6 },
  seatGrid: { flexDirection: 'row', gap: 6, marginTop: 10 },
  seatFact: { backgroundColor: c.surfaceMuted, borderColor: c.border, borderRadius: 6, borderWidth: 1, flex: 1, minHeight: 52, padding: 8 },
  seatLabel: { color: c.textSubtle, fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  seatValue: { color: c.text, fontSize: 12, fontWeight: '800', lineHeight: 16, marginTop: 3 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  editButton: {
    alignItems: 'center',
    backgroundColor: c.primary,
    borderRadius: 7,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 40,
  },
  editButtonText: { color: c.onPrimary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  previewButton: {
    alignItems: 'center',
    backgroundColor: c.surfaceMuted,
    borderColor: c.border,
    borderRadius: 7,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 40,
  },
  previewButtonText: { color: c.textSecondary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  visibilityToggle: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 12,
    position: 'absolute',
    right: 12,
    top: 12,
  },
  // The Visible/Hidden pill sits on the ticket art, so it keeps fixed colours in both schemes.
  visibilityToggleVisible: { backgroundColor: '#15803D' },
  visibilityToggleHidden: { backgroundColor: '#374151' },
  visibilityToggleText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', letterSpacing: 0.4 },
  hiddenContent: { opacity: 0.5 },
  deleteButton: {
    alignItems: 'center',
    borderColor: c.dangerBorder,
    borderRadius: 7,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 40,
    width: 40,
  },
  deleteButtonText: { color: c.danger, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  emptyState: {
    alignItems: 'center',
    backgroundColor: c.surface,
    borderColor: c.border,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  emptyTitle: { color: c.text, fontSize: 16, fontWeight: '800', lineHeight: 21, textAlign: 'center' },
  emptyBody: { color: c.textMuted, fontSize: 13, fontWeight: '500', lineHeight: 18, textAlign: 'center' },
  fab: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: c.primary,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 7,
    minHeight: 50,
    paddingHorizontal: 20,
    position: 'absolute',
  },
  fabSecondary: { backgroundColor: c.inverse },
  fabText: { color: c.onPrimary, fontSize: 13, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  fabSecondaryText: { color: c.onInverse },
  toast: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: c.toast,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: 'absolute',
  },
  toastText: { color: c.onToast, fontSize: 13, fontWeight: '700' },
  sheetBackdrop: { backgroundColor: c.overlay, flex: 1, justifyContent: 'flex-end' },
  sheet: { backgroundColor: c.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  sheetHandle: { alignSelf: 'center', backgroundColor: c.borderStrong, borderRadius: 999, height: 4, marginBottom: 18, width: 40 },
  sheetTitle: { color: c.text, fontSize: 19, fontWeight: '800', lineHeight: 24 },
  sheetBody: { color: c.textMuted, fontSize: 14, fontWeight: '500', lineHeight: 20, marginTop: 8 },
  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  sheetCancel: {
    alignItems: 'center',
    borderColor: c.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
  },
  sheetDelete: { alignItems: 'center', backgroundColor: c.dangerStrong, borderRadius: 8, flex: 1, justifyContent: 'center', minHeight: 46 },
  sheetDeleteDisabled: { opacity: 0.7 },
  sheetCancelText: { color: c.textSecondary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  sheetDeleteText: { color: c.onPrimary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
}));
