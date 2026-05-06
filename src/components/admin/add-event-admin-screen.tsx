import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
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
  ticketType: 'Ticket Type',
  status: 'Status',
  perks: 'Perks',
  transferRules: 'Transfer Rules',
  image: 'Image URL',
  backgroundColor: 'Accent Color',
};

const requiredFields: FieldKey[] = [
  'eventName',
  'artistName',
  'albumName',
  'venue',
  'city',
  'state',
  'country',
  'date',
  'time',
  'purchaseDate',
  'section',
  'row',
  'seatRange',
  'barcode',
  'ticketType',
  'status',
  'image',
  'backgroundColor',
];

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
  ticketType: '',
  status: 'upcoming',
  perks: '',
  transferRules: '',
  image: '',
  backgroundColor: '#B79E6A',
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

  function handleSave() {
    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      Alert.alert('Finish required fields', 'Please complete the highlighted ticket fields.');
      return;
    }

    const payload = toTicketInput(form);

    if (mode === 'edit' && ticketId) {
      updateEvent(ticketId, payload);
      showToast('Ticket updated');
      router.replace({ pathname: '/admin', params: { toast: 'updated' } });
      return;
    }

    addEvent(payload);
    showToast('Ticket created');
    router.replace({ pathname: '/admin', params: { toast: 'created' } });
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
        allowsEditing: false,
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
        <StatusBar style="light" backgroundColor="#050505" />
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Ticket not found</Text>
          <Pressable onPress={() => router.replace('/admin')} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Back to Admin</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor="#050505" />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.headerSafe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.replace('/admin')} style={styles.iconButton}>
            <Ionicons color="#FFFFFF" name="chevron-back" size={20} />
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
              <Image contentFit="contain" source={{ uri: form.image }} style={styles.previewImage} />
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
            <TicketTextField error={errors.barcode} label="Barcode" onChangeText={(value) => updateField('barcode', value)} value={form.barcode} />
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
        <Pressable onPress={() => router.replace('/admin')} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </Pressable>
        <Pressable onPress={handleSave} style={styles.primaryButton}>
          <Ionicons color="#FFFFFF" name={mode === 'edit' ? 'save-outline' : 'add'} size={17} />
          <Text style={styles.primaryButtonText}>{submitLabel}</Text>
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

const styles = StyleSheet.create({
  root: { backgroundColor: '#050505', flex: 1 },
  flex: { flex: 1 },
  headerSafe: { backgroundColor: '#050505' },
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
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerCopy: { alignItems: 'center', flex: 1 },
  eyebrow: {
    color: '#B79E6A',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    lineHeight: 13,
  },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', lineHeight: 24 },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.52)',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    marginTop: 2,
    maxWidth: 250,
    textAlign: 'center',
  },
  content: { gap: 22, paddingHorizontal: 16, paddingTop: 12 },
  modeBanner: {
    alignItems: 'center',
    backgroundColor: '#101010',
    borderColor: 'rgba(183,158,106,0.28)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  modeIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(183,158,106,0.12)',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  modeCopy: { flex: 1 },
  modeTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', lineHeight: 18 },
  modeText: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    marginTop: 3,
  },
  previewCard: { backgroundColor: '#101010', borderRadius: 8, overflow: 'hidden' },
  previewImage: { backgroundColor: '#1A1A1A', height: 272, width: '100%' },
  previewPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    gap: 8,
    height: 272,
    justifyContent: 'center',
    width: '100%',
  },
  previewPlaceholderText: {
    color: 'rgba(255,255,255,0.56)',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
  previewAccent: { height: 4 },
  previewBody: { padding: 14 },
  previewKicker: {
    color: '#B79E6A',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  previewName: { color: '#FFFFFF', fontSize: 23, fontWeight: '900', lineHeight: 27, marginTop: 4 },
  previewMeta: { color: 'rgba(255,255,255,0.68)', fontSize: 13, fontWeight: '600', lineHeight: 18, marginTop: 6 },
  section: { gap: 10 },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  sectionBody: { backgroundColor: '#101010', borderRadius: 8, gap: 14, padding: 14 },
  row: { flexDirection: 'row', gap: 10 },
  field: { flex: 1, gap: 7 },
  label: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
    lineHeight: 13,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    borderWidth: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    minHeight: 50,
    paddingHorizontal: 13,
  },
  multilineInput: { minHeight: 88, paddingTop: 13, textAlignVertical: 'top' },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 11, fontWeight: '700', lineHeight: 15 },
  imageUploadRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  uploadButton: {
    alignItems: 'center',
    backgroundColor: '#005BD3',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 46,
  },
  uploadButtonDisabled: { opacity: 0.62 },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  clearImageButton: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 8,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  segmentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segment: {
    backgroundColor: '#1A1A1A',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  segmentActive: { backgroundColor: '#B79E6A', borderColor: '#B79E6A' },
  segmentText: { color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '900' },
  segmentTextActive: { color: '#050505' },
  footer: {
    alignItems: 'center',
    backgroundColor: '#050505',
    borderTopColor: 'rgba(255,255,255,0.1)',
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
    minHeight: 50,
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 50,
  },
  secondaryButtonText: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  toast: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#151515',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    borderWidth: 1,
    bottom: 96,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: 'absolute',
  },
  toastText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  notFound: { alignItems: 'center', flex: 1, gap: 16, justifyContent: 'center', padding: 24 },
  notFoundTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
});
