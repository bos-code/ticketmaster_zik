import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdminDateTimeField } from '@/components/admin/admin-date-time-field';
import { StatusBarChrome } from '@/components/status-bar-chrome';
import {
  TICKET_STATUS_OPTIONS,
  TICKET_TYPE_OPTIONS,
  type TicketInput,
  type TicketStatus,
  type TicketType,
  useTicketStore,
} from '@/store/ticketStore';

type FormState = Record<keyof TicketInput, string>;
type FieldKey = keyof FormState;

const fieldLabels: Record<FieldKey, string> = {
  eventName: 'Event Name',
  artistName: 'Artist Name',
  albumName: 'Album Name',
  venue: 'Venue',
  city: 'City',
  state: 'State',
  country: 'Country',
  date: 'Date',
  time: 'Time',
  purchaseDate: 'Purchase Date',
  section: 'Section',
  row: 'Row',
  seatRange: 'Seat Range',
  barcode: 'Barcode',
  orderNumber: 'Order Number',
  ticketType: 'Ticket Type',
  status: 'Status',
  perks: 'Perks',
  transferRules: 'Transfer Rules',
  image: 'Image URL',
  backgroundColor: 'Accent Color',
  seatLabel: 'Seat Label',
  ticketNote: 'Ticket Note',
};

const requiredFields: FieldKey[] = [];

const EMPTY_CREATE_FORM: FormState = {
  eventName: '',
  artistName: '',
  albumName: '',
  venue: '',
  city: '',
  state: '',
  country: '',
  date: '',
  time: '',
  purchaseDate: '',
  section: '',
  row: '',
  seatRange: '',
  barcode: '',
  orderNumber: '19-12465/DAL',
  ticketType: '',
  status: 'upcoming',
  perks: '',
  transferRules: '',
  image: '',
  backgroundColor: '#B79E6A',
  seatLabel: '',
  ticketNote: '',
};

export function AddEventAdminScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode?: string; ticketId?: string }>();
  const mode = params.mode === 'edit' ? 'edit' : 'create';
  const ticketId = typeof params.ticketId === 'string' ? params.ticketId : undefined;
  const addEvent = useTicketStore((state) => state.addEvent);
  const updateEvent = useTicketStore((state) => state.updateEvent);
  const selectedTicket = useTicketStore((state) =>
    ticketId ? state.tickets.find((ticket) => ticket.id === ticketId) : undefined,
  );
  const [form, setForm] = useState<FormState>(() =>
    selectedTicket ? toFormState(selectedTicket) : EMPTY_CREATE_FORM,
  );
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const screenTitle = mode === 'edit' ? 'Edit Ticket' : 'Create New Ticket';
  const screenSubtitle =
    mode === 'edit'
      ? 'Update any ticket detail and save it everywhere.'
      : 'Add the event details, ticket info, and artwork for a brand-new ticket.';
  const submitLabel = mode === 'edit' ? 'Update Ticket' : 'Create New Ticket';

  useEffect(() => {
    if (mode === 'edit' && selectedTicket) {
      setForm(toFormState(selectedTicket));
      setErrors({});
      return;
    }

    if (mode === 'create') {
      setForm(EMPTY_CREATE_FORM);
      setErrors({});
    }
  }, [mode, selectedTicket]);

  const previewTitle = useMemo(
    () => `${form.ticketType || 'Ticket'} / ${form.status || 'upcoming'}`,
    [form.status, form.ticketType],
  );

  function handleLeaveAdminForm() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/admin');
  }

  function updateField(key: FieldKey, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) {
        return current;
      }

      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  async function handleSave() {
    if (isSaving) {
      return;
    }

    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      Alert.alert('Review ticket fields', 'Please fix the highlighted ticket fields.');
      return;
    }

    const payload = toTicketInput(form);

    try {
      setIsSaving(true);

      if (mode === 'edit' && ticketId) {
        await updateEvent(ticketId, payload);
        showToast('Ticket updated');
        router.replace({ pathname: '/admin', params: { toast: 'updated' } });
        return;
      }

      await addEvent(payload);
      showToast('Ticket created');
      router.replace({ pathname: '/admin', params: { toast: 'created' } });
    } catch (error) {
      console.warn('Ticket save failed.', error);
      Alert.alert(
        'Save failed',
        getTicketSaveErrorMessage(error),
      );
    } finally {
      setIsSaving(false);
    }
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 1800);
  }

  async function handlePickImage() {
    if (isPickingImage) {
      return;
    }

    try {
      setIsPickingImage(true);

      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            'Photos permission needed',
            'Allow photo library access so you can upload ticket artwork.',
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [16, 9],
        base64: true,
        mediaTypes: ['images'],
        quality: 1,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      updateField('image', buildPickedImageUri(result.assets[0]));
    } catch {
      Alert.alert('Image upload unavailable', 'The photo library could not be opened right now.');
    } finally {
      setIsPickingImage(false);
    }
  }

  if (mode === 'edit' && ticketId && !selectedTicket) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBarChrome style="dark" backgroundColor="#F5F6F8" />
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Ticket not found</Text>
          <Pressable onPress={handleLeaveAdminForm} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Back to Admin</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBarChrome style="dark" backgroundColor="#F5F6F8" />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.headerSafe}>
        <View style={styles.header}>
          <Pressable onPress={handleLeaveAdminForm} style={styles.iconButton}>
            <Ionicons color="#374151" name="chevron-back" size={20} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>ADMIN TICKETS</Text>
            <Text style={styles.title}>{screenTitle}</Text>
            <Text style={styles.headerSubtitle}>{screenSubtitle}</Text>
          </View>
          <View style={styles.iconButton} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: 128 + insets.bottom }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.modeBanner}>
            <View style={styles.modeIcon}>
              <Ionicons
                color="#B79E6A"
                name={mode === 'edit' ? 'create-outline' : 'add-circle-outline'}
                size={20}
              />
            </View>
            <View style={styles.modeCopy}>
              <Text style={styles.modeTitle}>
                {mode === 'edit' ? 'Editing existing ticket' : 'Create a brand-new ticket'}
              </Text>
              <Text style={styles.modeText}>
                {mode === 'edit'
                  ? 'Saving will update this ticket immediately in Admin and My Tickets.'
                  : 'Fill in the required fields, upload artwork or paste an image URL, then tap Create New Ticket.'}
              </Text>
            </View>
          </View>

          <View style={styles.previewCard}>
            {form.image.trim() ? (
              <Image contentFit="cover" source={{ uri: form.image }} style={styles.previewImage} />
            ) : (
              <View style={styles.previewPlaceholder}>
                <Ionicons color="rgba(255,255,255,0.5)" name="image-outline" size={32} />
                <Text style={styles.previewPlaceholderText}>Upload ticket artwork</Text>
              </View>
            )}
            <View style={[styles.previewAccent, { backgroundColor: form.backgroundColor || '#B79E6A' }]} />
            <View style={styles.previewBody}>
              <Text style={styles.previewKicker}>{previewTitle}</Text>
              <Text style={styles.previewName}>{form.eventName || 'Untitled Ticket'}</Text>
              <Text style={styles.previewMeta}>
                {form.artistName || 'Artist'} at {form.venue || 'Venue'}
              </Text>
            </View>
          </View>

          <FormSection title="Event">
            <TicketTextField error={errors.eventName} label="Event Name" onChangeText={(value) => updateField('eventName', value)} value={form.eventName} />
            <View style={styles.row}>
              <TicketTextField error={errors.artistName} label="Artist Name" onChangeText={(value) => updateField('artistName', value)} value={form.artistName} />
              <TicketTextField error={errors.albumName} label="Album Name" onChangeText={(value) => updateField('albumName', value)} value={form.albumName} />
            </View>
            <View style={styles.imageUploadRow}>
              <Pressable
                disabled={isPickingImage}
                onPress={handlePickImage}
                style={[styles.uploadButton, isPickingImage && styles.uploadButtonDisabled]}
              >
                {isPickingImage ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Ionicons color="#FFFFFF" name="cloud-upload-outline" size={16} />
                )}
                <Text style={styles.uploadButtonText}>
                  {form.image ? 'Replace Image' : 'Upload Image'}
                </Text>
              </Pressable>
              {form.image ? (
                <Pressable onPress={() => updateField('image', '')} style={styles.clearImageButton}>
                  <Ionicons color="rgba(255,255,255,0.72)" name="close" size={16} />
                </Pressable>
              ) : null}
            </View>
            <TicketTextField
              error={errors.image}
              label="Image URL"
              onChangeText={(value) => updateField('image', value)}
              placeholder="Upload an image or paste a URL"
              value={form.image}
            />
          </FormSection>

          <FormSection title="Venue">
            <TicketTextField error={errors.venue} label="Venue" onChangeText={(value) => updateField('venue', value)} value={form.venue} />
            <View style={styles.row}>
              <TicketTextField error={errors.city} label="City" onChangeText={(value) => updateField('city', value)} value={form.city} />
              <TicketTextField error={errors.state} label="State" onChangeText={(value) => updateField('state', value)} value={form.state} />
            </View>
            <TicketTextField error={errors.country} label="Country" onChangeText={(value) => updateField('country', value)} value={form.country} />
          </FormSection>

          <FormSection title="Schedule">
            <View style={styles.row}>
              <AdminDateTimeField
                error={errors.date}
                label="Date"
                mode="date"
                onChangeValue={(value) => updateField('date', value)}
                placeholder="2026-12-19"
                value={form.date}
              />
              <AdminDateTimeField
                error={errors.time}
                label="Time"
                mode="time"
                onChangeValue={(value) => updateField('time', value)}
                placeholder="8:30 PM"
                value={form.time}
              />
            </View>
            <AdminDateTimeField
              error={errors.purchaseDate}
              label="Purchase Date"
              mode="date"
              onChangeValue={(value) => updateField('purchaseDate', value)}
              placeholder="2026-04-30"
              value={form.purchaseDate}
            />
          </FormSection>

          <FormSection title="Seat Details">
            <View style={styles.row}>
              <TicketTextField error={errors.section} label="Section" onChangeText={(value) => updateField('section', value)} value={form.section} />
              <TicketTextField error={errors.row} label="Row" onChangeText={(value) => updateField('row', value)} value={form.row} />
            </View>
            <TicketTextField error={errors.seatRange} label="Seat Range" onChangeText={(value) => updateField('seatRange', value)} value={form.seatRange} />
            <TicketTextField error={errors.orderNumber} label="Order Number" onChangeText={(value) => updateField('orderNumber', value)} placeholder="e.g. 19-12465/DAL" value={form.orderNumber} />
            <TicketTextField error={errors.seatLabel} label="Seat Label" onChangeText={(value) => updateField('seatLabel', value)} placeholder="e.g. Artist presale, Fan verified" value={form.seatLabel} />
            <TicketTextField error={errors.ticketNote} label="Ticket Note" onChangeText={(value) => updateField('ticketNote', value)} placeholder="e.g. Lower bowl seating" value={form.ticketNote} />
          </FormSection>

          <FormSection title="Ticket Info">
            <SegmentedOptions
              label="Ticket Type"
              options={TICKET_TYPE_OPTIONS}
              selected={form.ticketType}
              onSelect={(value) => updateField('ticketType', value)}
            />
            <SegmentedOptions
              label="Status"
              options={TICKET_STATUS_OPTIONS}
              selected={form.status}
              onSelect={(value) => updateField('status', value)}
            />
            <TicketTextField error={errors.perks} label="Perks" multiline onChangeText={(value) => updateField('perks', value)} value={form.perks} />
            <TicketTextField error={errors.transferRules} label="Transfer Rules" multiline onChangeText={(value) => updateField('transferRules', value)} value={form.transferRules} />
            <TicketTextField error={errors.backgroundColor} label="Accent Color" onChangeText={(value) => updateField('backgroundColor', value)} value={form.backgroundColor} />
          </FormSection>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable
          disabled={isSaving}
          onPress={handleLeaveAdminForm}
          style={[styles.secondaryButton, isSaving && styles.buttonDisabled]}
        >
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </Pressable>
        {mode === 'edit' && ticketId ? (
          <Pressable
            disabled={isSaving}
            onPress={() => router.push({ pathname: '/admin/preview', params: { ticketId } })}
            style={[styles.previewFooterButton, isSaving && styles.buttonDisabled]}
          >
            <Ionicons color="#B79E6A" name="eye-outline" size={17} />
          </Pressable>
        ) : null}
        <Pressable
          disabled={isSaving}
          onPress={() => {
            void handleSave();
          }}
          style={[styles.primaryButton, isSaving && styles.buttonDisabled]}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons color="#FFFFFF" name={mode === 'edit' ? 'save-outline' : 'add'} size={17} />
              <Text style={styles.primaryButtonText}>{submitLabel}</Text>
            </>
          )}
        </Pressable>
      </View>

      {toast ? (
        <View style={styles.toast}>
          <Ionicons color="#FFFFFF" name="checkmark-circle" size={16} />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </View>
  );
}

function FormSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function TicketTextField({
  error,
  label,
  multiline,
  onChangeText,
  placeholder,
  value,
}: {
  error?: string;
  label: string;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.32)"
        style={[styles.input, multiline && styles.multilineInput, error && styles.inputError]}
        value={value}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function SegmentedOptions<T extends string>({
  label,
  onSelect,
  options,
  selected,
}: {
  label: string;
  onSelect: (value: T) => void;
  options: readonly T[];
  selected: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.segmentRow}>
        {options.map((option) => {
          const active = option === selected;

          return (
            <Pressable
              key={option}
              onPress={() => onSelect(option)}
              style={[styles.segment, active && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function validateForm(form: FormState) {
  const errors: Partial<Record<FieldKey, string>> = {};

  requiredFields.forEach((field) => {
    if (!form[field].trim()) {
      errors[field] = `${fieldLabels[field]} is required.`;
    }
  });

  if (form.ticketType && !TICKET_TYPE_OPTIONS.includes(form.ticketType as TicketType)) {
    errors.ticketType = 'Choose VIP, Standard, or General.';
  }

  if (form.status && !TICKET_STATUS_OPTIONS.includes(form.status as TicketStatus)) {
    errors.status = 'Choose upcoming or past.';
  }

  return errors;
}

function toFormState(ticket: TicketInput): FormState {
  return { ...ticket };
}

function toTicketInput(form: FormState): TicketInput {
  return {
    ...form,
    ticketType: form.ticketType as TicketType,
    status: form.status as TicketStatus,
  };
}

function buildPickedImageUri(asset: ImagePicker.ImagePickerAsset) {
  if (asset.base64) {
    const mimeType = asset.mimeType?.startsWith('image/') ? asset.mimeType : 'image/jpeg';
    return `data:${mimeType};base64,${asset.base64}`;
  }

  return asset.uri;
}

function getTicketSaveErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : '';

  if (
    message.toLowerCase().includes('cloudinary') ||
    message.includes('storage/') ||
    message.toLowerCase().includes('firebase storage')
  ) {
    return 'The ticket details are valid, but the artwork upload is not ready. Paste an Image URL, or add a Cloudinary unsigned upload preset and try again.';
  }

  return 'We could not save this ticket to Firebase right now. Please try again.';
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#F5F6F8', flex: 1 },
  flex: { flex: 1 },
  headerSafe: { backgroundColor: '#F5F6F8' },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 62,
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 6,
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
  headerCopy: { alignItems: 'center', flex: 1 },
  eyebrow: {
    color: '#005BD3',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    lineHeight: 13,
  },
  title: { color: '#111827', fontSize: 18, fontWeight: '800', lineHeight: 23 },
  headerSubtitle: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
    marginTop: 2,
    maxWidth: 250,
    textAlign: 'center',
  },
  content: { gap: 20, paddingHorizontal: 16, paddingTop: 12 },
  modeBanner: {
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  modeIcon: {
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  modeCopy: { flex: 1 },
  modeTitle: { color: '#1E40AF', fontSize: 13, fontWeight: '800', lineHeight: 18 },
  modeText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    marginTop: 3,
  },
  previewCard: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: 10, borderWidth: 1, overflow: 'hidden' },
  previewImage: { aspectRatio: 16 / 9, backgroundColor: '#F3F4F6', width: '100%' },
  previewPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    gap: 8,
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    width: '100%',
  },
  previewPlaceholderText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
  },
  previewAccent: { height: 3 },
  previewBody: { padding: 14 },
  previewKicker: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  previewName: { color: '#111827', fontSize: 20, fontWeight: '800', lineHeight: 25, marginTop: 3 },
  previewMeta: { color: '#6B7280', fontSize: 13, fontWeight: '500', lineHeight: 18, marginTop: 5 },
  section: { gap: 8 },
  sectionTitle: {
    color: '#374151',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  sectionBody: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: 10, borderWidth: 1, gap: 14, padding: 14 },
  row: { flexDirection: 'row', gap: 10 },
  field: { flex: 1, gap: 6 },
  label: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    lineHeight: 13,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
    minHeight: 48,
    paddingHorizontal: 13,
  },
  multilineInput: { minHeight: 80, paddingTop: 12, textAlignVertical: 'top' },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 11, fontWeight: '600', lineHeight: 15 },
  imageUploadRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  uploadButton: {
    alignItems: 'center',
    backgroundColor: '#005BD3',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 44,
  },
  uploadButtonDisabled: { opacity: 0.62 },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  clearImageButton: {
    alignItems: 'center',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  segmentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segment: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  segmentActive: { backgroundColor: '#005BD3', borderColor: '#005BD3' },
  segmentText: { color: '#374151', fontSize: 12, fontWeight: '700' },
  segmentTextActive: { color: '#FFFFFF' },
  footer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E5E7EB',
    borderTopWidth: StyleSheet.hairlineWidth,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    left: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    position: 'absolute',
    right: 0,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#005BD3',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonDisabled: { opacity: 0.62 },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  previewFooterButton: {
    alignItems: 'center',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    width: 48,
  },
  toast: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#111827',
    borderRadius: 999,
    bottom: 96,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: 'absolute',
  },
  toastText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  notFound: { alignItems: 'center', flex: 1, gap: 16, justifyContent: 'center', padding: 24 },
  notFoundTitle: { color: '#111827', fontSize: 20, fontWeight: '800' },
});
