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
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { DEFAULT_TRANSFER_SENDER_NAME } from '@/constants/admin-settings';
import { updateAdminSettings } from '@/lib/firebase-data';
import { lockAdminSession } from '@/lib/admin-pass-key';
import { useAppStore } from '@/store/use-app-store';
import {
  formatTicketDate,
  type TicketRecord,
  type TicketType,
  useTicketStore,
} from '@/store/ticketStore';

type AdminTab = 'tickets' | 'transfer-name';
type TicketFilter = 'All' | 'Upcoming' | TicketType | 'Past' | 'Hidden';

const adminTabs: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  key: AdminTab;
  label: string;
}[] = [
  { icon: 'ticket-outline', key: 'tickets', label: 'Tickets' },
  { icon: 'mail-outline', key: 'transfer-name', label: 'Transfer Name' },
];

const filters: TicketFilter[] = ['All', 'Upcoming', 'VIP', 'Standard', 'General', 'Past', 'Hidden'];

export function AdminTicketManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ toast?: string }>();
  const tickets = useTicketStore((state) => state.tickets);
  const removeEvent = useTicketStore((state) => state.removeEvent);
  const updateEvent = useTicketStore((state) => state.updateEvent);
  const transferSenderName = useAppStore((state) => state.transferSenderName);
  const setTransferSenderName = useAppStore(
    (state) => state.setTransferSenderName,
  );
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('tickets');
  const [activeFilter, setActiveFilter] = useState<TicketFilter>('All');
  const [deleteTarget, setDeleteTarget] = useState<TicketRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingTransferName, setIsSavingTransferName] = useState(false);
  const [transferSenderDraft, setTransferSenderDraft] =
    useState(transferSenderName);
  const [visibilityUpdatingId, setVisibilityUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (params.toast === 'created') {
      showToast('Ticket created');
    }

    if (params.toast === 'updated') {
      showToast('Ticket updated');
    }
  }, [params.toast]);

  useEffect(() => {
    setTransferSenderDraft(transferSenderName);
  }, [transferSenderName]);

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
          return ticket.isHidden;
        }

        return ticket.ticketType === activeFilter;
      }),
    [activeFilter, tickets],
  );

  const upcomingTickets = visibleTickets.filter((ticket) => ticket.status === 'upcoming');
  const pastTickets = visibleTickets.filter((ticket) => ticket.status === 'past');
  const normalizedTransferSenderName =
    transferSenderName.trim() || DEFAULT_TRANSFER_SENDER_NAME;
  const normalizedTransferSenderDraft = transferSenderDraft.trim();
  const isTransferSenderDirty =
    normalizedTransferSenderDraft !== normalizedTransferSenderName;

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 1800);
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

  async function handleToggleHidden(ticket: TicketRecord) {
    if (visibilityUpdatingId) {
      return;
    }

    const nextHidden = !ticket.isHidden;

    try {
      setVisibilityUpdatingId(ticket.id);
      await updateEvent(ticket.id, { isHidden: nextHidden });
      showToast(nextHidden ? 'Ticket hidden' : 'Ticket visible');
    } catch {
      Alert.alert(
        'Visibility update failed',
        'We could not update this ticket in Firebase right now. Please try again.',
      );
    } finally {
      setVisibilityUpdatingId(null);
    }
  }

  async function handleSaveTransferSenderName() {
    if (isSavingTransferName) {
      return;
    }

    const nextName = normalizedTransferSenderDraft;

    if (!nextName) {
      Alert.alert('Transfer name required', 'Enter the sender name shown in transfer emails.');
      return;
    }

    try {
      setIsSavingTransferName(true);
      await updateAdminSettings({ transferSenderName: nextName });
      setTransferSenderName(nextName);
      showToast('Transfer name updated');
    } catch {
      Alert.alert(
        'Save failed',
        'We could not update the transfer name in Firebase right now. Please try again.',
      );
    } finally {
      setIsSavingTransferName(false);
    }
  }

  function handleExitAdmin() {
    lockAdminSession();

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/my-tickets');
  }

  return (
    <ScreenWrapper backgroundColor="#F5F6F8">
      <Head>
        <meta name="theme-color" content="#F5F6F8" />
        <meta name="color-scheme" content="light" />
      </Head>
      <StatusBar style="dark" backgroundColor="#F5F6F8" />
      <View style={styles.header}>
          <Pressable onPress={handleExitAdmin} style={styles.iconButton}>
            <Ionicons color="#374151" name="chevron-back" size={20} />
          </Pressable>
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

      <View style={styles.adminTabsWrap}>
        <View style={styles.adminTabsRow}>
          {adminTabs.map((tab) => {
            const active = activeAdminTab === tab.key;

            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveAdminTab(tab.key)}
                style={[styles.adminTabButton, active && styles.adminTabButtonActive]}
              >
                <Ionicons
                  color={active ? '#005BD3' : '#6B7280'}
                  name={tab.icon}
                  size={16}
                />
                <Text style={[styles.adminTabText, active && styles.adminTabTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {activeAdminTab === 'tickets' ? (
        <>
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
                  onToggleHidden={(ticket) => {
                    void handleToggleHidden(ticket);
                  }}
                  tickets={upcomingTickets}
                  visibilityUpdatingId={visibilityUpdatingId}
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
                  onToggleHidden={(ticket) => {
                    void handleToggleHidden(ticket);
                  }}
                  tickets={pastTickets}
                  visibilityUpdatingId={visibilityUpdatingId}
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
        </>
      ) : (
        <TransferNameSettings
          bottomInset={insets.bottom}
          currentName={normalizedTransferSenderName}
          draftName={transferSenderDraft}
          isDirty={isTransferSenderDirty}
          isSaving={isSavingTransferName}
          onChangeDraft={setTransferSenderDraft}
          onReset={() => setTransferSenderDraft(normalizedTransferSenderName)}
          onSave={() => {
            void handleSaveTransferSenderName();
          }}
        />
      )}

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
          <Ionicons color="#FFFFFF" name="checkmark-circle" size={16} />
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
        <AdminTicketCard
          key={ticket.id}
          isVisibilityUpdating={visibilityUpdatingId === ticket.id}
          onDelete={() => onDelete(ticket)}
          onEdit={() => onEdit(ticket)}
          onPreview={() => onPreview(ticket)}
          onToggleHidden={() => onToggleHidden(ticket)}
          ticket={ticket}
        />
      ))}
    </View>
  );
}

function TransferNameSettings({
  bottomInset,
  currentName,
  draftName,
  isDirty,
  isSaving,
  onChangeDraft,
  onReset,
  onSave,
}: {
  bottomInset: number;
  currentName: string;
  draftName: string;
  isDirty: boolean;
  isSaving: boolean;
  onChangeDraft: (value: string) => void;
  onReset: () => void;
  onSave: () => void;
}) {
  const previewName = draftName.trim() || currentName;
  const canSave = isDirty && Boolean(draftName.trim()) && !isSaving;

  return (
    <ScrollView
      contentContainerStyle={[
        styles.settingsContent,
        { paddingBottom: 36 + bottomInset },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.settingsCard}>
        <View style={styles.settingsHeader}>
          <View style={styles.settingsIcon}>
            <Ionicons color="#005BD3" name="mail-outline" size={20} />
          </View>
          <View style={styles.settingsHeaderCopy}>
            <Text style={styles.settingsEyebrow}>TRANSFER EMAIL</Text>
            <Text style={styles.settingsTitle}>Sender Name</Text>
            <Text style={styles.settingsBody}>
              This name appears in the Help Center transfer email preview.
            </Text>
          </View>
        </View>

        <View style={styles.nameField}>
          <Text style={styles.nameLabel}>Name</Text>
          <TextInput
            accessibilityLabel="Transfer sender name"
            autoCapitalize="words"
            editable={!isSaving}
            onChangeText={onChangeDraft}
            placeholder={DEFAULT_TRANSFER_SENDER_NAME}
            placeholderTextColor="#9CA3AF"
            returnKeyType="done"
            style={styles.nameInput}
            value={draftName}
          />
        </View>

        <View style={styles.senderPreviewBlock}>
          <Text style={styles.senderPreviewLabel}>Email Preview</Text>
          <Text style={styles.senderPreviewSubject}>
            {previewName} sent you ticket(s) for
          </Text>
          <Text style={styles.senderPreviewHeadline}>
            Your Ticket Transfer From {previewName} Is Ready To Be Accepted!
          </Text>
        </View>

        <View style={styles.settingsActions}>
          <Pressable
            disabled={!isDirty || isSaving}
            onPress={onReset}
            style={[
              styles.resetNameButton,
              (!isDirty || isSaving) && styles.nameButtonDisabled,
            ]}
          >
            <Text style={styles.resetNameButtonText}>Reset</Text>
          </Pressable>
          <Pressable
            disabled={!canSave}
            onPress={onSave}
            style={[styles.saveNameButton, !canSave && styles.nameButtonDisabled]}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons color="#FFFFFF" name="save-outline" size={16} />
                <Text style={styles.saveNameButtonText}>Save Name</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

function AdminTicketCard({
  isVisibilityUpdating,
  onDelete,
  onEdit,
  onPreview,
  onToggleHidden,
  ticket,
}: {
  isVisibilityUpdating: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onPreview: () => void;
  onToggleHidden: () => void;
  ticket: TicketRecord;
}) {
  const visibilityIcon = ticket.isHidden ? 'eye-outline' : 'eye-off-outline';
  const visibilityLabel = ticket.isHidden ? 'Show ticket' : 'Hide ticket';

  return (
    <View style={[styles.card, ticket.isHidden && styles.hiddenCard]}>
      <View style={styles.artPanel}>
        <Image contentFit="cover" source={{ uri: ticket.image }} style={styles.cardImage} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.82)']} style={styles.imageGradient} />
        <View style={[styles.artAccent, { backgroundColor: ticket.backgroundColor }]} />
        <View style={styles.badgeRow}>
          <Badge label={ticket.ticketType} tone="gold" />
          <Badge label={ticket.status} tone={ticket.status === 'upcoming' ? 'blue' : 'muted'} />
          {ticket.isHidden ? <Badge label="Hidden" tone="muted" /> : null}
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
          <Pressable
            accessibilityLabel={visibilityLabel}
            disabled={isVisibilityUpdating}
            onPress={onToggleHidden}
            style={[
              styles.visibilityButton,
              ticket.isHidden && styles.visibilityButtonHidden,
              isVisibilityUpdating && styles.visibilityButtonDisabled,
            ]}
          >
            {isVisibilityUpdating ? (
              <ActivityIndicator color="#005BD3" size="small" />
            ) : (
              <Ionicons
                color={ticket.isHidden ? '#005BD3' : '#374151'}
                name={visibilityIcon}
                size={17}
              />
            )}
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
            <Pressable disabled={isDeleting} onPress={onCancel} style={styles.sheetCancel}>
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              disabled={isDeleting}
              onPress={onConfirm}
              style={[styles.sheetDelete, isDeleting && styles.sheetDeleteDisabled]}
            >
              {isDeleting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
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

const styles = StyleSheet.create({
  root: { backgroundColor: '#F5F6F8', flex: 1 },
  safe: { backgroundColor: '#F5F6F8' },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
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
  adminTabsWrap: {
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  adminTabsRow: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 3,
    padding: 3,
  },
  adminTabButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 8,
  },
  adminTabButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  adminTabText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  adminTabTextActive: {
    color: '#005BD3',
  },
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
  settingsContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 10,
    borderWidth: 1,
    gap: 16,
    padding: 16,
  },
  settingsHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  settingsIcon: {
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  settingsHeaderCopy: {
    flex: 1,
  },
  settingsEyebrow: {
    color: '#005BD3',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.7,
    lineHeight: 13,
  },
  settingsTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 25,
    marginTop: 2,
  },
  settingsBody: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    marginTop: 5,
  },
  nameField: {
    gap: 6,
  },
  nameLabel: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    lineHeight: 13,
    textTransform: 'uppercase',
  },
  nameInput: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
    minHeight: 50,
    paddingHorizontal: 14,
  },
  senderPreviewBlock: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 14,
  },
  senderPreviewLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
    lineHeight: 13,
    textTransform: 'uppercase',
  },
  senderPreviewSubject: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 22,
  },
  senderPreviewHeadline: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  settingsActions: {
    flexDirection: 'row',
    gap: 10,
  },
  resetNameButton: {
    alignItems: 'center',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  resetNameButtonText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  saveNameButton: {
    alignItems: 'center',
    backgroundColor: '#005BD3',
    borderRadius: 8,
    flex: 1.4,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 48,
  },
  saveNameButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  nameButtonDisabled: {
    opacity: 0.45,
  },
  section: { gap: 10 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  sectionTitle: { color: '#374151', fontSize: 11, fontWeight: '900', letterSpacing: 1.3, textTransform: 'uppercase' },
  sectionCount: { color: '#9CA3AF', fontSize: 12, fontWeight: '700' },
  card: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: 10, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  hiddenCard: { borderColor: '#CBD5E1' },
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
  visibilityButton: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
    borderRadius: 7,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 40,
    width: 40,
  },
  visibilityButtonHidden: { backgroundColor: '#EFF6FF', borderColor: '#93C5FD' },
  visibilityButtonDisabled: { opacity: 0.7 },
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
  sheetDeleteDisabled: { opacity: 0.7 },
  sheetCancelText: { color: '#374151', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  sheetDeleteText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
});
