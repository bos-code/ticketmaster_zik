import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { StatusBar } from 'expo-status-bar';

import { ticketSpacing, ticketColors as defaultTicketColors } from '@/constants/ticket-theme';
import {
  type CreateAdminEventInput,
  useEventStore,
} from '@/store/use-event-store';

const ticketColors = {
  ...defaultTicketColors,
  backgroundDeep: '#050505',
  background: '#050505',
  chrome: '#101010',
  chromeElevated: '#1A1A1A',
  chromeSoft: '#202020',
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.16)',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.68)',
  textSubtle: 'rgba(255, 255, 255, 0.45)',
  primary: '#005BD3',
  primaryBright: '#005BD3',
  primarySoft: 'rgba(0, 91, 211, 0.2)',
};

const TICKET_TYPE_OPTIONS = [
  'Standard Ticket',
  'VIP Ticket',
  'Premium Admission',
  'Mobile Transfer',
  'Guest Pass',
] as const;

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const FIELD_LABELS: Record<FieldKey, string> = {
  eventImage: 'Featured Image',
  venueName: 'Stadium/Venue Name',
  city: 'City',
  state: 'State',
  eventDate: 'Event Date',
  time: 'Event Time',
  section: 'Section',
  row: 'Row',
  seatFrom: 'Seat Range From',
  seatTo: 'Seat Range To',
  barcodeNumber: 'Barcode Number',
  ticketType: 'Ticket Type',
  purchaseDate: 'Purchase Date',
  entryInfo: 'Entry Info',
};

type FieldKey =
  | 'eventImage'
  | 'venueName'
  | 'city'
  | 'state'
  | 'eventDate'
  | 'time'
  | 'section'
  | 'row'
  | 'seatFrom'
  | 'seatTo'
  | 'barcodeNumber'
  | 'ticketType'
  | 'purchaseDate'
  | 'entryInfo';

type UploadedEventImage = {
  fileName: string | null;
  fileSize?: number;
  height: number;
  mimeType?: string;
  uri: string;
  width: number;
};

type FormState = {
  additionalTicketInfo: string;
  barcodeNumber: string;
  city: string;
  entryInfo: string;
  eventDate: Date | null;
  eventImage: UploadedEventImage | null;
  purchaseDate: Date | null;
  row: string;
  seatFrom: string;
  seatTo: string;
  section: string;
  state: string;
  ticketType: string;
  time: Date | null;
  venueName: string;
};

type FieldErrors = Partial<Record<FieldKey, string>>;

const INITIAL_FORM: FormState = {
  additionalTicketInfo: '',
  barcodeNumber: '',
  city: '',
  entryInfo: '',
  eventDate: null,
  eventImage: null,
  purchaseDate: null,
  row: '',
  seatFrom: '',
  seatTo: '',
  section: '',
  state: '',
  ticketType: '',
  time: null,
  venueName: '',
};

export function AddEventAdminScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const createAdminEvent = useEventStore((state) => state.createAdminEvent);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [activeDateField, setActiveDateField] = useState<'eventDate' | 'purchaseDate' | null>(null);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [ticketTypeVisible, setTicketTypeVisible] = useState(false);
  const [isPickingImage, setIsPickingImage] = useState(false);

  const footerPadding = Math.max(insets.bottom, ticketSpacing.sm);
  const previewImageUri = useMemo(
    () => resolvePreviewImage(form.eventImage?.uri, form.ticketType),
    [form.eventImage?.uri, form.ticketType],
  );

  const previewSections = useMemo(
    () => [
      {
        title: 'Event Artwork',
        rows: [
          ['Artwork Source', form.eventImage ? 'Custom upload selected' : 'Ticket-type fallback artwork'],
          ['Image Name', form.eventImage?.fileName || '--'],
          ['Image Size', formatImageDetails(form.eventImage)],
        ],
      },
      {
        title: 'Event Details',
        rows: [
          ['Stadium/Venue Name', form.venueName || '--'],
          ['City', form.city || '--'],
          ['State', form.state || '--'],
        ],
      },
      {
        title: 'Schedule',
        rows: [
          ['Date', form.eventDate ? formatDisplayDate(form.eventDate) : '--'],
          ['Time', form.time ? formatDisplayTime(form.time) : '--'],
          ['Purchase Date', form.purchaseDate ? formatPurchaseDate(form.purchaseDate) : '--'],
        ],
      },
      {
        title: 'Seat Details',
        rows: [
          ['Section', form.section || '--'],
          ['Row', form.row || '--'],
          ['Seat Range', form.seatFrom && form.seatTo ? `${form.seatFrom} - ${form.seatTo}` : '--'],
          ['Barcode Number', form.barcodeNumber || '--'],
        ],
      },
      {
        title: 'Ticket Info',
        rows: [
          ['Ticket Type', form.ticketType || '--'],
          ['Additional Ticket Info', form.additionalTicketInfo || '--'],
        ],
      },
      {
        title: 'Additional Info',
        rows: [['Entry Info', form.entryInfo || '--']],
      },
    ],
    [form],
  );

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setErrors((current) => {
      if (!current[key as FieldKey]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[key as FieldKey];
      return nextErrors;
    });
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
            'Allow photo library access so admins can upload event artwork.',
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [16, 9],
        base64: true,
        mediaTypes: ['images'],
        quality: 0.85,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];

      updateField('eventImage', {
        fileName: asset.fileName ?? null,
        fileSize: asset.fileSize,
        height: asset.height,
        mimeType: asset.mimeType ?? undefined,
        uri: buildPickedImageUri(asset),
        width: asset.width,
      });
    } catch {
      Alert.alert(
        'Image upload unavailable',
        'The photo library could not be opened right now. Please try again.',
      );
    } finally {
      setIsPickingImage(false);
    }
  }

  function handleRemoveImage() {
    updateField('eventImage', null);
  }

  function handleSaveDraft() {
    setDraftSavedAt(new Date());
  }

  function handlePreview() {
    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      showValidationAlert(nextErrors, 'preview');
      return;
    }

    setPreviewVisible(true);
  }

  function handleAddEvent() {
    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      showValidationAlert(nextErrors, 'submit');
      return;
    }

    try {
      const payload = toCreateAdminEventInput(form);
      const createdEvent = createAdminEvent(payload);

      setPreviewVisible(false);
      setDraftSavedAt(null);
      setForm(INITIAL_FORM);
      setErrors({});

      Alert.alert(
        'Event added',
        `${createdEvent.title} is ready and now appears in Discover.`,
        [
          {
            text: 'Stay Here',
          },
          {
            text: 'Open Discover',
            onPress: () => router.replace('/discover'),
          },
        ],
      );
    } catch {
      Alert.alert(
        'Could not add event',
        'Something went wrong while creating the event. Please try again.',
      );
    }
  }

  function showValidationAlert(nextErrors: FieldErrors, action: 'preview' | 'submit') {
    const invalidFields = Object.keys(nextErrors) as FieldKey[];
    const visibleFields = invalidFields.slice(0, 4).map((field) => FIELD_LABELS[field]);
    const extraCount = invalidFields.length - visibleFields.length;
    const message = [
      `Please complete or fix: ${visibleFields.join(', ')}.`,
      extraCount > 0 ? `Plus ${extraCount} more field${extraCount === 1 ? '' : 's'}.` : null,
      action === 'submit'
        ? 'After that, tap Add Event again.'
        : 'After that, tap Preview again.',
    ]
      .filter(Boolean)
      .join(' ');

    Alert.alert('Finish required fields', message);
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor="#000000" />

      {/* ── Header ── */}
      <SafeAreaView edges={['top', 'left', 'right']} style={{ backgroundColor: '#000000' }}>
        <View style={styles.headerBar}>
          <View style={styles.headerBarInner}>
            <View style={styles.headerBarLeft} />
            <View style={styles.headerBarCenter}>
              <Text style={styles.headerEyebrow}>ADMIN</Text>
              <Text style={styles.headerTitle}>Add Event</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace('/discover')}
              style={styles.headerCloseBtn}
            >
              <Ionicons color="rgba(255,255,255,0.8)" name="close" size={18} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ paddingBottom: 140 + footerPadding }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Admin notice */}
            <View style={styles.adminBanner}>
              <View style={styles.adminBannerAccent} />
              <View style={styles.adminBannerIcon}>
                <Ionicons color="#005BD3" name="shield-checkmark-outline" size={16} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.adminBannerTitle}>Admin-only route</Text>
                <Text style={styles.adminBannerBody}>Protected when auth roles are wired up.</Text>
              </View>
            </View>

            {/* ── Event Artwork ── */}
            <FormSection title="Event Artwork">
              {form.eventImage ? (
                <Image
                  contentFit="cover"
                  source={{ uri: form.eventImage.uri }}
                  style={styles.uploadedImage}
                />
              ) : (
                <Pressable
                  accessibilityRole="button"
                  disabled={isPickingImage}
                  onPress={handlePickImage}
                  style={styles.uploadZone}
                >
                  <View style={styles.uploadIconCircle}>
                    <Ionicons color="#FFFFFF" name="cloud-upload-outline" size={22} />
                  </View>
                  <Text style={styles.uploadZoneTitle}>Tap to upload event photo</Text>
                  <Text style={styles.uploadZoneHint}>16:9 recommended · JPG or PNG</Text>
                </Pressable>
              )}

              <View style={styles.imageMetaRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.imageMetaTitle}>
                    {form.eventImage?.fileName ?? 'Ticket-type fallback artwork'}
                  </Text>
                  <Text style={styles.imageMetaBody}>
                    {form.eventImage
                      ? formatImageDetails(form.eventImage)
                      : 'A fallback hero image will be used until you upload one.'}
                  </Text>
                </View>
                {isPickingImage ? (
                  <ActivityIndicator color="#005BD3" size="small" />
                ) : null}
              </View>

              <View style={styles.imageActionRow}>
                <Pressable
                  accessibilityRole="button"
                  disabled={isPickingImage}
                  onPress={handlePickImage}
                  style={[styles.imgBtn, styles.imgBtnPrimary, isPickingImage && { opacity: 0.6 }]}
                >
                  <Ionicons color="#FFF" name={form.eventImage ? 'refresh-outline' : 'cloud-upload-outline'} size={15} />
                  <Text style={styles.imgBtnPrimaryText}>
                    {isPickingImage ? 'Opening…' : form.eventImage ? 'Replace' : 'Upload Image'}
                  </Text>
                </Pressable>
                {form.eventImage ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={handleRemoveImage}
                    style={[styles.imgBtn, styles.imgBtnGhost]}
                  >
                    <Ionicons color="rgba(255,255,255,0.7)" name="trash-outline" size={15} />
                    <Text style={styles.imgBtnGhostText}>Remove</Text>
                  </Pressable>
                ) : null}
              </View>
            </FormSection>

            {/* ── Event Details ── */}
            <FormSection title="Event Details">
              <TextField
                error={errors.venueName}
                helperText="Full stadium or venue name."
                label="Stadium / Venue Name"
                onChangeText={(v) => updateField('venueName', v)}
                placeholder="e.g. Madison Square Garden"
                value={form.venueName}
              />
              <View style={styles.row}>
                <View style={styles.rowField}>
                  <TextField
                    error={errors.city}
                    helperText="City of the event."
                    label="City"
                    onChangeText={(v) => updateField('city', v)}
                    placeholder="e.g. New York"
                    value={form.city}
                  />
                </View>
                <View style={styles.rowField}>
                  <TextField
                    autoCapitalize="characters"
                    error={errors.state}
                    helperText="State abbreviation."
                    label="State"
                    onChangeText={(v) => updateField('state', v)}
                    placeholder="e.g. NY"
                    value={form.state}
                  />
                </View>
              </View>
            </FormSection>

            {/* ── Schedule ── */}
            <FormSection title="Schedule">
              <View style={styles.row}>
                <View style={styles.rowField}>
                  <PickerField
                    error={errors.eventDate}
                    helperText="Event date."
                    label="Date"
                    onPress={() => setActiveDateField('eventDate')}
                    placeholder="Jun 18, 2026"
                    value={form.eventDate ? formatDisplayDate(form.eventDate) : ''}
                  />
                </View>
                <View style={styles.rowField}>
                  <PickerField
                    error={errors.time}
                    helperText="Event time."
                    label="Time"
                    onPress={() => setTimePickerVisible(true)}
                    placeholder="7:30 PM"
                    value={form.time ? formatDisplayTime(form.time) : ''}
                  />
                </View>
              </View>
              <PickerField
                error={errors.purchaseDate}
                helperText="When was this ticket purchased?"
                label="Purchase Date"
                onPress={() => setActiveDateField('purchaseDate')}
                placeholder="Apr 20, 2026"
                value={form.purchaseDate ? formatPurchaseDate(form.purchaseDate) : ''}
              />
            </FormSection>

            {/* ── Seat Details ── */}
            <FormSection title="Seat Details">
              <View style={styles.row}>
                <View style={styles.rowField}>
                  <TextField
                    autoCapitalize="characters"
                    error={errors.section}
                    helperText="Section label."
                    label="Section"
                    onChangeText={(v) => updateField('section', v)}
                    placeholder="e.g. 102"
                    value={form.section}
                  />
                </View>
                <View style={styles.rowField}>
                  <TextField
                    autoCapitalize="characters"
                    error={errors.row}
                    helperText="Row label."
                    label="Row"
                    onChangeText={(v) => updateField('row', v)}
                    placeholder="e.g. B"
                    value={form.row}
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.rowField}>
                  <TextField
                    error={errors.seatFrom}
                    helperText="First seat number."
                    keyboardType="number-pad"
                    label="Seat From"
                    onChangeText={(v) => updateField('seatFrom', v.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 12"
                    value={form.seatFrom}
                  />
                </View>
                <View style={styles.rowField}>
                  <TextField
                    error={errors.seatTo}
                    helperText="Last seat number."
                    keyboardType="number-pad"
                    label="Seat To"
                    onChangeText={(v) => updateField('seatTo', v.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 15"
                    value={form.seatTo}
                  />
                </View>
              </View>
              <TextField
                error={errors.barcodeNumber}
                helperText="Barcode or internal reference number."
                keyboardType="number-pad"
                label="Barcode Number"
                onChangeText={(v) => updateField('barcodeNumber', v.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 100234567890"
                value={form.barcodeNumber}
              />
            </FormSection>

            {/* ── Ticket Info ── */}
            <FormSection title="Ticket Info">
              <PickerField
                error={errors.ticketType}
                helperText="Choose the ticket category."
                label="Ticket Type"
                onPress={() => setTicketTypeVisible(true)}
                placeholder="Select a ticket type"
                value={form.ticketType}
              />
              <TextField
                helperText="Transfer rules, perks, special notes."
                label="Additional Info"
                multiline
                onChangeText={(v) => updateField('additionalTicketInfo', v)}
                placeholder="e.g. Includes lounge access and mobile transfer only"
                value={form.additionalTicketInfo}
              />
            </FormSection>

            {/* ── Entry Info ── */}
            <FormSection title="Entry Info">
              <TextField
                error={errors.entryInfo}
                helperText="Gate, check-in, age limits, or other entry notes."
                label="Entry Instructions"
                multiline
                onChangeText={(v) => updateField('entryInfo', v)}
                placeholder="e.g. Enter through Gate C with a matching photo ID"
                value={form.entryInfo}
              />
            </FormSection>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* ── Sticky Footer ── */}
      <View style={[styles.footer, { paddingBottom: Math.max(footerPadding, 16) }]}>
        <View style={styles.footerMeta}>
          {draftSavedAt ? (
            <Text style={styles.footerNote}>{`Draft saved at ${formatSavedTime(draftSavedAt)}`}</Text>
          ) : (
            <Text style={styles.footerNote}>Save, preview, or publish when ready.</Text>
          )}
        </View>
        <View style={styles.footerActions}>
          <Pressable accessibilityRole="button" onPress={handleSaveDraft} style={styles.footerGhostBtn}>
            <Text style={styles.footerGhostBtnText}>SAVE DRAFT</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={handlePreview} style={styles.footerGhostBtn}>
            <Text style={styles.footerGhostBtnText}>PREVIEW</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={handleAddEvent} style={styles.footerPrimaryBtn}>
            <Ionicons color="#FFFFFF" name="add" size={16} />
            <Text style={styles.footerPrimaryBtnText}>ADD EVENT</Text>
          </Pressable>
        </View>
      </View>

      <CalendarPickerModal
        title={activeDateField === 'purchaseDate' ? 'Select Purchase Date' : 'Select Event Date'}
        value={activeDateField ? form[activeDateField] : null}
        visible={Boolean(activeDateField)}
        onClose={() => setActiveDateField(null)}
        onConfirm={(value) => {
          if (activeDateField) updateField(activeDateField, value);
          setActiveDateField(null);
        }}
      />
      <TimePickerModal
        value={form.time}
        visible={timePickerVisible}
        onClose={() => setTimePickerVisible(false)}
        onConfirm={(value) => { updateField('time', value); setTimePickerVisible(false); }}
      />
      <OptionPickerModal
        options={TICKET_TYPE_OPTIONS}
        title="Choose Ticket Type"
        value={form.ticketType}
        visible={ticketTypeVisible}
        onClose={() => setTicketTypeVisible(false)}
        onSelect={(value) => { updateField('ticketType', value); setTicketTypeVisible(false); }}
      />
      <PreviewModal
        imageUri={previewImageUri}
        sections={previewSections}
        visible={previewVisible}
        onClose={() => setPreviewVisible(false)}
        onSubmit={handleAddEvent}
      />
    </View>
  );
}

function FormSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>{title.toUpperCase()}</Text>
        <View style={styles.sectionAccent} />
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function FieldShell({ children, error, helperText, label }: { children: React.ReactNode; error?: string; helperText?: string; label: string }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>
      {children}
      {(error ?? helperText) ? (
        <Text style={[styles.fieldHelper, error ? styles.fieldHelperError : null]}>
          {error ?? helperText}
        </Text>
      ) : null}
    </View>
  );
}

function TextField({ error, helperText, label, multiline, ...props }: React.ComponentProps<typeof TextInput> & { error?: string; helperText?: string; label: string }) {
  return (
    <FieldShell error={error} helperText={helperText} label={label}>
      <TextInput
        placeholderTextColor="rgba(255,255,255,0.3)"
        style={[styles.input, multiline && styles.inputMultiline, error && styles.inputError]}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...props}
      />
    </FieldShell>
  );
}

function PickerField({ error, helperText, label, onPress, placeholder, value }: { error?: string; helperText?: string; label: string; onPress: () => void; placeholder: string; value: string }) {
  return (
    <FieldShell error={error} helperText={helperText} label={label}>
      <Pressable accessibilityRole="button" onPress={onPress} style={[styles.pickerField, error && styles.inputError]}>
        <Text style={[styles.pickerValue, !value && styles.pickerPlaceholder]}>{value || placeholder}</Text>
        <Ionicons color="rgba(255,255,255,0.4)" name="chevron-down" size={18} />
      </Pressable>
    </FieldShell>
  );
}

function ActionButton({ label, onPress, variant }: { label: string; onPress: () => void; variant: 'primary' | 'secondary' }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.actionButton, variant === 'primary' ? styles.actionButtonPrimary : styles.actionButtonSecondary]}
    >
      <Text style={[styles.actionButtonText, variant === 'primary' ? styles.actionButtonTextPrimary : styles.actionButtonTextSecondary]}>
        {label}
      </Text>
    </Pressable>
  );
}

function PreviewModal({
  imageUri,
  sections,
  visible,
  onClose,
  onSubmit,
}: {
  imageUri?: string | null;
  sections: { rows: string[][]; title: string }[];
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.modalBackdrop}>
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.modalSafeArea}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalEyebrow}>Preview</Text>
                <Text style={styles.modalTitle}>Review event details</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={onClose} style={styles.modalCloseButton}>
                <Ionicons color={ticketColors.text} name="close" size={18} />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.previewContent}
              showsVerticalScrollIndicator={false}
            >
              {imageUri ? (
                <Image contentFit="cover" source={{ uri: imageUri }} style={styles.previewHeroImage} />
              ) : null}

              {sections.map((section) => (
                <View key={section.title} style={styles.previewSection}>
                  <Text style={styles.previewSectionTitle}>{section.title}</Text>
                  {section.rows.map(([label, value]) => (
                    <View key={label} style={styles.previewRow}>
                      <Text style={styles.previewLabel}>{label}</Text>
                      <Text style={styles.previewValue}>{value}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <ActionButton label="Back" onPress={onClose} variant="secondary" />
              <ActionButton label="Add Event" onPress={onSubmit} variant="primary" />
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function OptionPickerModal({
  options,
  title,
  value,
  visible,
  onClose,
  onSelect,
}: {
  options: readonly string[];
  title: string;
  value: string;
  visible: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
}) {
  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.modalBackdrop}>
        <View style={styles.sheetCard}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons color={ticketColors.text} name="close" size={18} />
            </Pressable>
          </View>
          <View style={styles.sheetOptions}>
            {options.map((option) => {
              const active = value === option;

              return (
                <Pressable
                  accessibilityRole="button"
                  key={option}
                  onPress={() => onSelect(option)}
                  style={[styles.optionRow, active && styles.optionRowActive]}
                >
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>{option}</Text>
                  {active ? (
                    <Ionicons color={ticketColors.primaryBright} name="checkmark-circle" size={18} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function TimePickerModal({
  value,
  visible,
  onClose,
  onConfirm,
}: {
  value: Date | null;
  visible: boolean;
  onClose: () => void;
  onConfirm: (value: Date) => void;
}) {
  const source = value ?? defaultTimeValue();
  const [hour, setHour] = useState(getTwelveHour(source));
  const [minute, setMinute] = useState(source.getMinutes());
  const [meridiem, setMeridiem] = useState<'AM' | 'PM'>(source.getHours() >= 12 ? 'PM' : 'AM');

  React.useEffect(() => {
    if (!visible) {
      return;
    }

    const nextSource = value ?? defaultTimeValue();
    setHour(getTwelveHour(nextSource));
    setMinute(nextSource.getMinutes());
    setMeridiem(nextSource.getHours() >= 12 ? 'PM' : 'AM');
  }, [value, visible]);

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.modalBackdrop}>
        <View style={styles.sheetCard}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Select Time</Text>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons color={ticketColors.text} name="close" size={18} />
            </Pressable>
          </View>

          <View style={styles.timeGrid}>
            <TimeColumn
              label="Hour"
              options={Array.from({ length: 12 }, (_, index) => String(index + 1))}
              value={String(hour)}
              onSelect={(nextValue) => setHour(Number(nextValue))}
            />
            <TimeColumn
              label="Minute"
              options={Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, '0'))}
              value={String(minute).padStart(2, '0')}
              onSelect={(nextValue) => setMinute(Number(nextValue))}
            />
            <TimeColumn
              label="AM/PM"
              options={['AM', 'PM']}
              value={meridiem}
              onSelect={(nextValue) => setMeridiem(nextValue as 'AM' | 'PM')}
            />
          </View>

          <View style={styles.modalActions}>
            <ActionButton label="Cancel" onPress={onClose} variant="secondary" />
            <ActionButton
              label="Use Time"
              onPress={() => onConfirm(buildTimeValue(hour, minute, meridiem))}
              variant="primary"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function TimeColumn({
  label,
  onSelect,
  options,
  value,
}: {
  label: string;
  onSelect: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <View style={styles.timeColumn}>
      <Text style={styles.timeColumnLabel}>{label}</Text>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.timeColumnScroll}>
        <View style={styles.timeOptionList}>
          {options.map((option) => {
            const active = option === value;

            return (
              <Pressable
                accessibilityRole="button"
                key={option}
                onPress={() => onSelect(option)}
                style={[styles.timeOption, active && styles.timeOptionActive]}
              >
                <Text style={[styles.timeOptionText, active && styles.timeOptionTextActive]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function CalendarPickerModal({
  title,
  value,
  visible,
  onClose,
  onConfirm,
}: {
  title: string;
  value: Date | null;
  visible: boolean;
  onClose: () => void;
  onConfirm: (value: Date) => void;
}) {
  const [cursor, setCursor] = useState(startOfMonth(value ?? new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(value ?? new Date());

  React.useEffect(() => {
    if (!visible) {
      return;
    }

    const nextValue = value ?? new Date();
    setCursor(startOfMonth(nextValue));
    setSelectedDate(nextValue);
  }, [value, visible]);

  const calendarDays = useMemo(() => buildCalendarDays(cursor, selectedDate), [cursor, selectedDate]);

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.modalBackdrop}>
        <View style={styles.calendarCard}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons color={ticketColors.text} name="close" size={18} />
            </Pressable>
          </View>

          <View style={styles.calendarHeader}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setCursor((current) => addMonths(current, -1))}
              style={styles.monthButton}
            >
              <Ionicons color={ticketColors.text} name="chevron-back" size={16} />
            </Pressable>
            <Text style={styles.calendarMonthLabel}>{formatMonthLabel(cursor)}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setCursor((current) => addMonths(current, 1))}
              style={styles.monthButton}
            >
              <Ionicons color={ticketColors.text} name="chevron-forward" size={16} />
            </Pressable>
          </View>

          <View style={styles.dayLabelRow}>
            {DAY_LABELS.map((label) => (
              <Text key={label} style={styles.dayLabel}>
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarDays.map((day) =>
              day ? (
                <Pressable
                  accessibilityRole="button"
                  key={day.key}
                  onPress={() => setSelectedDate(day.date)}
                  style={[styles.dateCell, day.active && styles.dateCellActive]}
                >
                  <Text style={[styles.dateCellText, day.active && styles.dateCellTextActive]}>
                    {day.label}
                  </Text>
                </Pressable>
              ) : (
                <View key={`blank-${Math.random()}`} style={styles.dateCellBlank} />
              ),
            )}
          </View>

          <View style={styles.modalActions}>
            <ActionButton label="Cancel" onPress={onClose} variant="secondary" />
            <ActionButton label="Use Date" onPress={() => onConfirm(selectedDate)} variant="primary" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function validateForm(form: FormState): FieldErrors {
  const nextErrors: FieldErrors = {};

  if (!form.venueName.trim()) {
    nextErrors.venueName = 'Please add the stadium or venue name.';
  }

  if (!form.city.trim()) {
    nextErrors.city = 'Please add the event city.';
  }

  if (!form.state.trim()) {
    nextErrors.state = 'Please add the event state.';
  }

  if (!form.eventDate) {
    nextErrors.eventDate = 'Please choose an event date.';
  }

  if (!form.time) {
    nextErrors.time = 'Please choose an event time.';
  }

  if (!form.section.trim()) {
    nextErrors.section = 'Please enter the section.';
  }

  if (!form.row.trim()) {
    nextErrors.row = 'Please enter the row.';
  }

  if (!form.barcodeNumber.trim()) {
    nextErrors.barcodeNumber = 'Please enter the barcode number.';
  }

  if (!form.ticketType.trim()) {
    nextErrors.ticketType = 'Please choose the ticket type.';
  }

  if (!form.purchaseDate) {
    nextErrors.purchaseDate = 'Please choose the purchase date.';
  }

  if (!form.entryInfo.trim()) {
    nextErrors.entryInfo = 'Please add entry instructions.';
  }

  const seatFrom = Number(form.seatFrom);
  const seatTo = Number(form.seatTo);

  if (!form.seatFrom.trim()) {
    nextErrors.seatFrom = 'Please enter the first seat number.';
  }

  if (!form.seatTo.trim()) {
    nextErrors.seatTo = 'Please enter the last seat number.';
  }

  if (form.seatFrom.trim() && Number.isNaN(seatFrom)) {
    nextErrors.seatFrom = 'Seat range must use numbers only.';
  }

  if (form.seatTo.trim() && Number.isNaN(seatTo)) {
    nextErrors.seatTo = 'Seat range must use numbers only.';
  }

  if (!nextErrors.seatFrom && !nextErrors.seatTo && seatFrom > seatTo) {
    nextErrors.seatFrom = 'The starting seat should be smaller than the ending seat.';
    nextErrors.seatTo = 'The ending seat should come after the starting seat.';
  }

  return nextErrors;
}

function toCreateAdminEventInput(form: FormState): CreateAdminEventInput {
  return {
    additionalTicketInfo: form.additionalTicketInfo.trim(),
    barcodeNumber: form.barcodeNumber.trim(),
    city: form.city.trim(),
    entryInfo: form.entryInfo.trim(),
    eventDate: form.eventDate ?? new Date(),
    imageUrl: form.eventImage?.uri ?? null,
    purchaseDate: form.purchaseDate ?? new Date(),
    row: form.row.trim(),
    seatFrom: Number(form.seatFrom),
    seatTo: Number(form.seatTo),
    section: form.section.trim(),
    state: form.state.trim(),
    ticketType: form.ticketType.trim(),
    time: form.time ?? defaultTimeValue(),
    venueName: form.venueName.trim(),
  };
}

function buildCalendarDays(cursor: Date, selectedDate: Date) {
  const totalDays = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const leadingBlanks = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay();
  const slots: ({ active: boolean; date: Date; key: string; label: string } | null)[] = [];

  for (let index = 0; index < leadingBlanks; index += 1) {
    slots.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const nextDate = new Date(cursor.getFullYear(), cursor.getMonth(), day);
    slots.push({
      active: isSameCalendarDay(nextDate, selectedDate),
      date: nextDate,
      key: nextDate.toISOString(),
      label: String(day),
    });
  }

  while (slots.length < 35) {
    slots.push(null);
  }

  return slots;
}

function addMonths(value: Date, amount: number) {
  return new Date(value.getFullYear(), value.getMonth() + amount, 1);
}

function buildTimeValue(hour: number, minute: number, meridiem: 'AM' | 'PM') {
  const nextDate = new Date();
  let normalizedHour = hour % 12;

  if (meridiem === 'PM') {
    normalizedHour += 12;
  }

  nextDate.setHours(normalizedHour, minute, 0, 0);
  return nextDate;
}

function defaultTimeValue() {
  const nextDate = new Date();
  nextDate.setHours(19, 0, 0, 0);
  return nextDate;
}

function buildPickedImageUri(asset: ImagePicker.ImagePickerAsset) {
  if (asset.base64) {
    const mimeType = asset.mimeType?.startsWith('image/') ? asset.mimeType : 'image/jpeg';
    return `data:${mimeType};base64,${asset.base64}`;
  }

  return asset.uri;
}

function formatDisplayDate(value: Date) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(value);
}

function formatDisplayTime(value: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(value);
}

function formatMonthLabel(value: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(value);
}

function formatPurchaseDate(value: Date) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(value);
}

function formatSavedTime(value: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(value);
}

function resolvePreviewImage(imageUrl: string | null | undefined, ticketType: string) {
  const normalizedImageUrl = imageUrl?.trim();

  if (normalizedImageUrl) {
    return normalizedImageUrl;
  }

  const value = ticketType.toLowerCase();

  if (value.includes('vip') || value.includes('premium')) {
    return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80';
  }

  if (value.includes('mobile') || value.includes('digital')) {
    return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80';
  }

  return 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80';
}

function formatImageDetails(image: UploadedEventImage | null) {
  if (!image) {
    return '--';
  }

  const dimensionLabel = `${image.width} x ${image.height}`;

  if (!image.fileSize) {
    return dimensionLabel;
  }

  const fileSizeInMb = image.fileSize / (1024 * 1024);
  return `${dimensionLabel} - ${fileSizeInMb.toFixed(1)} MB`;
}

function getTwelveHour(value: Date) {
  const hour = value.getHours() % 12;
  return hour === 0 ? 12 : hour;
}

function isSameCalendarDay(left: Date, right: Date) {
  return (
    left.getDate() === right.getDate() &&
    left.getMonth() === right.getMonth() &&
    left.getFullYear() === right.getFullYear()
  );
}

function startOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

const styles = StyleSheet.create({
  // ── Root ──
  root: { backgroundColor: '#050505', flex: 1 },

  // ── Header ──
  headerBar: { backgroundColor: '#050505', paddingHorizontal: 16, paddingTop: 4, paddingBottom: 14 },
  headerBarInner: { flexDirection: 'row', alignItems: 'center', minHeight: 52 },
  headerBarLeft: { width: 40 },
  headerBarCenter: { flex: 1, alignItems: 'center' },
  headerEyebrow: { color: '#B79E6A', fontSize: 10, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase', lineHeight: 13 },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', lineHeight: 24 },
  headerCloseBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },

  // ── Admin banner ──
  adminBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#101010', marginHorizontal: 16, marginTop: 16, marginBottom: 4, borderRadius: 10, paddingVertical: 12, paddingRight: 14, overflow: 'hidden' },
  adminBannerAccent: { width: 3, height: '100%', backgroundColor: '#005BD3', position: 'absolute', left: 0, top: 0, bottom: 0 },
  adminBannerIcon: { marginLeft: 14, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,91,211,0.15)', alignItems: 'center', justifyContent: 'center' },
  adminBannerTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', lineHeight: 17 },
  adminBannerBody: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600', lineHeight: 15, marginTop: 1 },

  // ── Sections ──
  section: { marginTop: 24 },
  sectionHeader: { paddingHorizontal: 16, marginBottom: 12 },
  sectionLabel: { color: '#FFFFFF', fontSize: 11, fontWeight: '900', letterSpacing: 2.5, lineHeight: 14 },
  sectionAccent: { marginTop: 6, height: 2, width: 32, backgroundColor: '#B79E6A' },
  sectionBody: { backgroundColor: '#101010', paddingHorizontal: 16, paddingVertical: 16, gap: 16 },

  // ── Fields ──
  row: { flexDirection: 'row', gap: 12 },
  rowField: { flex: 1 },
  fieldBlock: { gap: 6 },
  fieldLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', lineHeight: 13 },
  fieldHelper: { color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: '500', lineHeight: 15 },
  fieldHelperError: { color: '#FF5B4A' },
  input: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 8, color: '#FFFFFF', fontSize: 14, fontWeight: '600', minHeight: 52, paddingHorizontal: 14 },
  inputMultiline: { minHeight: 100, paddingTop: 14 },
  inputError: { borderColor: '#FF5B4A' },
  pickerField: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 52, paddingHorizontal: 14 },
  pickerValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', flex: 1 },
  pickerPlaceholder: { color: 'rgba(255,255,255,0.3)' },

  // ── Image upload ──
  uploadedImage: { width: '100%', height: 200 },
  uploadZone: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderStyle: 'dashed', borderRadius: 10, minHeight: 160, alignItems: 'center', justifyContent: 'center', gap: 8 },
  uploadIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#005BD3', alignItems: 'center', justifyContent: 'center' },
  uploadZoneTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', lineHeight: 18 },
  uploadZoneHint: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '600', lineHeight: 14 },
  imageMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 10, paddingBottom: 4 },
  imageMetaTitle: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', lineHeight: 16 },
  imageMetaBody: { color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: '500', lineHeight: 15, marginTop: 2 },
  imageActionRow: { flexDirection: 'row', gap: 10, paddingTop: 4 },
  imgBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 8, minHeight: 42, paddingHorizontal: 14, justifyContent: 'center' },
  imgBtnPrimary: { backgroundColor: '#005BD3', flex: 1 },
  imgBtnPrimaryText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  imgBtnGhost: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', backgroundColor: 'transparent' },
  imgBtnGhostText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '700' },

  // ── Footer ──
  footer: { backgroundColor: '#050505', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingTop: 12, gap: 10, position: 'absolute', bottom: 0, left: 0, right: 0 },
  footerMeta: {},
  footerNote: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '600', lineHeight: 14 },
  footerActions: { flexDirection: 'row', gap: 8 },
  footerGhostBtn: { flex: 1, minHeight: 48, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  footerGhostBtnText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },
  footerPrimaryBtn: { flex: 2, minHeight: 48, borderRadius: 8, backgroundColor: '#005BD3', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  footerPrimaryBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },

  // ── Modals ──
  modalBackdrop: { backgroundColor: 'rgba(0,0,0,0.85)', flex: 1, justifyContent: 'flex-end' },
  modalSafeArea: { flex: 1, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#101010', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%', padding: 20 },
  modalHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  modalEyebrow: { color: '#B79E6A', fontSize: 10, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase', lineHeight: 13 },
  modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', lineHeight: 24, marginTop: 2 },
  modalCloseButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  previewContent: { gap: 12, paddingBottom: 16 },
  previewHeroImage: { borderRadius: 10, height: 180, width: '100%' },
  previewSection: { backgroundColor: '#1A1A1A', borderRadius: 10, gap: 8, padding: 14 },
  previewSectionTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', lineHeight: 17, textTransform: 'uppercase', letterSpacing: 1 },
  previewRow: { gap: 2 },
  previewLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '800', lineHeight: 14, textTransform: 'uppercase', letterSpacing: 0.8 },
  previewValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', lineHeight: 19 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  sheetCard: { backgroundColor: '#101010', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  sheetHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  sheetTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', lineHeight: 22 },
  sheetOptions: { gap: 8, marginBottom: 16 },
  optionRow: { alignItems: 'center', backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.08)', borderRadius: 10, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 52, paddingHorizontal: 14 },
  optionRowActive: { borderColor: '#005BD3', backgroundColor: 'rgba(0,91,211,0.15)' },
  optionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', lineHeight: 19 },
  optionTextActive: { color: '#005BD3' },
  timeGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  timeColumn: { flex: 1 },
  timeColumnLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8, textAlign: 'center', textTransform: 'uppercase' },
  timeColumnScroll: { maxHeight: 220 },
  timeOptionList: { gap: 6 },
  timeOption: { alignItems: 'center', backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.08)', borderRadius: 8, borderWidth: 1, minHeight: 42, justifyContent: 'center' },
  timeOptionActive: { backgroundColor: 'rgba(0,91,211,0.18)', borderColor: '#005BD3' },
  timeOptionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', lineHeight: 18 },
  timeOptionTextActive: { color: '#005BD3' },
  calendarCard: { backgroundColor: '#101010', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  calendarHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  monthButton: { alignItems: 'center', backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.08)', borderRadius: 999, borderWidth: 1, height: 36, justifyContent: 'center', width: 36 },
  calendarMonthLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', lineHeight: 20 },
  dayLabelRow: { flexDirection: 'row', marginBottom: 6 },
  dayLabel: { color: 'rgba(255,255,255,0.4)', flex: 1, fontSize: 11, fontWeight: '800', lineHeight: 14, textAlign: 'center' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  dateCell: { alignItems: 'center', borderRadius: 8, height: 40, justifyContent: 'center', marginBottom: 4, width: '14.28%' },
  dateCellActive: { backgroundColor: '#005BD3' },
  dateCellText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', lineHeight: 18 },
  dateCellTextActive: { color: '#FFFFFF' },
  dateCellBlank: { height: 40, marginBottom: 4, width: '14.28%' },

  // ── Action buttons (used in modals) ──
  actionButton: { alignItems: 'center', borderRadius: 8, flex: 1, justifyContent: 'center', minHeight: 48, paddingHorizontal: 12 },
  actionButtonPrimary: { backgroundColor: '#005BD3' },
  actionButtonSecondary: { backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.12)', borderWidth: 1 },
  actionButtonText: { fontSize: 13, fontWeight: '800', lineHeight: 18 },
  actionButtonTextPrimary: { color: '#FFFFFF' },
  actionButtonTextSecondary: { color: 'rgba(255,255,255,0.7)' },
});
