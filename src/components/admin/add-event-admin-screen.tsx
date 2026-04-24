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

import { ticketColors, ticketRadii, ticketSpacing } from '@/constants/ticket-theme';
import {
  type CreateAdminEventInput,
  useEventStore,
} from '@/store/use-event-store';

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
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={[
              styles.content,
              { paddingBottom: 132 + footerPadding },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.scroll}
          >
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Ionicons color={ticketColors.primaryBright} name="add-circle-outline" size={24} />
              </View>
              <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>Admin</Text>
                <Text style={styles.title}>Add Event</Text>
                <Text style={styles.subtitle}>
                  Create an event and ticket block with a form that stays clear and easy to finish.
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.replace('/discover')}
                style={styles.headerCloseButton}
              >
                <Ionicons color={ticketColors.text} name="close" size={18} />
              </Pressable>
            </View>

            <View style={styles.adminNotice}>
              <View style={styles.adminNoticeIcon}>
                <Ionicons color={ticketColors.primaryBright} name="shield-checkmark-outline" size={18} />
              </View>
              <View style={styles.adminNoticeCopy}>
                <Text style={styles.adminNoticeTitle}>Admin-only route</Text>
                <Text style={styles.adminNoticeBody}>
                  This screen is meant for admins and will be protected when auth roles are wired up.
                </Text>
              </View>
            </View>

            <FormSection
              description="Upload the hero artwork that should appear on the featured card and event details."
              title="Event Artwork"
            >
              <FieldShell
                helperText={
                  form.eventImage
                    ? 'Custom artwork is ready and will override the default ticket-type image.'
                    : 'Optional for now. If you skip this, the event uses a default image based on ticket type.'
                }
                label="Featured Image"
              >
                <View style={styles.imageFieldCard}>
                  {form.eventImage ? (
                    <Image
                      contentFit="cover"
                      source={{ uri: form.eventImage.uri }}
                      style={styles.uploadedImagePreview}
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <View style={styles.imagePlaceholderIcon}>
                        <Ionicons color={ticketColors.primaryBright} name="image-outline" size={20} />
                      </View>
                      <Text style={styles.imagePlaceholderTitle}>No custom image uploaded</Text>
                      <Text style={styles.imagePlaceholderBody}>
                        Select a cover image from the device library for this event.
                      </Text>
                    </View>
                  )}

                  <View style={styles.imageMetaRow}>
                    <View style={styles.imageMetaCopy}>
                      <Text style={styles.imageMetaTitle}>
                        {form.eventImage?.fileName || 'Ticket-type fallback artwork'}
                      </Text>
                      <Text style={styles.imageMetaBody}>
                        {form.eventImage
                          ? formatImageDetails(form.eventImage)
                          : 'A fallback hero image will be used until you upload one.'}
                      </Text>
                    </View>
                    {isPickingImage ? (
                      <ActivityIndicator color={ticketColors.primaryBright} size="small" />
                    ) : null}
                  </View>
                </View>

                <View style={styles.imageActionRow}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isPickingImage}
                    onPress={handlePickImage}
                    style={[
                      styles.imageActionButton,
                      styles.imageActionButtonPrimary,
                      isPickingImage && styles.imageActionButtonDisabled,
                    ]}
                  >
                    <Ionicons color="#FFFFFF" name={form.eventImage ? 'refresh-outline' : 'cloud-upload-outline'} size={16} />
                    <Text style={styles.imageActionButtonPrimaryText}>
                      {isPickingImage
                        ? 'Opening library...'
                        : form.eventImage
                          ? 'Replace image'
                          : 'Upload image'}
                    </Text>
                  </Pressable>

                  {form.eventImage ? (
                    <Pressable
                      accessibilityRole="button"
                      onPress={handleRemoveImage}
                      style={[styles.imageActionButton, styles.imageActionButtonSecondary]}
                    >
                      <Ionicons color={ticketColors.text} name="trash-outline" size={16} />
                      <Text style={styles.imageActionButtonSecondaryText}>Remove</Text>
                    </Pressable>
                  ) : null}
                </View>
              </FieldShell>
            </FormSection>

            <FormSection
              description="The main venue details that help identify the event quickly."
              title="Event Details"
            >
              <TextField
                error={errors.venueName}
                helperText="Use the full stadium or venue name."
                label="Stadium/Venue Name"
                onChangeText={(value) => updateField('venueName', value)}
                placeholder="e.g. Madison Square Garden"
                value={form.venueName}
              />

              <View style={styles.row}>
                <View style={styles.rowField}>
                  <TextField
                    error={errors.city}
                    helperText="City where the event takes place."
                    label="City"
                    onChangeText={(value) => updateField('city', value)}
                    placeholder="e.g. New York"
                    value={form.city}
                  />
                </View>
                <View style={styles.rowField}>
                  <TextField
                    autoCapitalize="characters"
                    error={errors.state}
                    helperText="State or region abbreviation works well."
                    label="State"
                    onChangeText={(value) => updateField('state', value)}
                    placeholder="e.g. NY"
                    value={form.state}
                  />
                </View>
              </View>
            </FormSection>

            <FormSection
              description="Pick the event timing with clear date and time controls."
              title="Schedule"
            >
              <View style={styles.row}>
                <View style={styles.rowField}>
                  <PickerField
                    error={errors.eventDate}
                    helperText="Choose the event date."
                    label="Date"
                    onPress={() => setActiveDateField('eventDate')}
                    placeholder="e.g. Jun 18, 2026"
                    value={form.eventDate ? formatDisplayDate(form.eventDate) : ''}
                  />
                </View>
                <View style={styles.rowField}>
                  <PickerField
                    error={errors.time}
                    helperText="Select the event time."
                    label="Time"
                    onPress={() => setTimePickerVisible(true)}
                    placeholder="e.g. 7:30 PM"
                    value={form.time ? formatDisplayTime(form.time) : ''}
                  />
                </View>
              </View>

              <PickerField
                error={errors.purchaseDate}
                helperText="When was this ticket purchased?"
                label="Purchase Date"
                onPress={() => setActiveDateField('purchaseDate')}
                placeholder="e.g. Apr 20, 2026"
                value={form.purchaseDate ? formatPurchaseDate(form.purchaseDate) : ''}
              />
            </FormSection>

            <FormSection
              description="Keep the seat block tidy so tickets are easy to generate and review."
              title="Seat Details"
            >
              <View style={styles.row}>
                <View style={styles.rowField}>
                  <TextField
                    autoCapitalize="characters"
                    error={errors.section}
                    helperText="Section label shown on the ticket."
                    label="Section"
                    onChangeText={(value) => updateField('section', value)}
                    placeholder="e.g. 102"
                    value={form.section}
                  />
                </View>
                <View style={styles.rowField}>
                  <TextField
                    autoCapitalize="characters"
                    error={errors.row}
                    helperText="Row label shown on the ticket."
                    label="Row"
                    onChangeText={(value) => updateField('row', value)}
                    placeholder="e.g. B"
                    value={form.row}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.rowField}>
                  <TextField
                    error={errors.seatFrom}
                    helperText="First seat number in this ticket block."
                    keyboardType="number-pad"
                    label="Seat Range From"
                    onChangeText={(value) => updateField('seatFrom', value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 12"
                    value={form.seatFrom}
                  />
                </View>
                <View style={styles.rowField}>
                  <TextField
                    error={errors.seatTo}
                    helperText="Last seat number in this ticket block."
                    keyboardType="number-pad"
                    label="Seat Range To"
                    onChangeText={(value) => updateField('seatTo', value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 15"
                    value={form.seatTo}
                  />
                </View>
              </View>

              <TextField
                error={errors.barcodeNumber}
                helperText="Use the barcode or internal ticket reference number."
                keyboardType="number-pad"
                label="Barcode Number"
                onChangeText={(value) => updateField('barcodeNumber', value.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 100234567890"
                value={form.barcodeNumber}
              />
            </FormSection>

            <FormSection
              description="Ticket-specific details that help the next person understand exactly what was added."
              title="Ticket Info"
            >
              <PickerField
                error={errors.ticketType}
                helperText="Choose the ticket category."
                label="Ticket Type"
                onPress={() => setTicketTypeVisible(true)}
                placeholder="Select a ticket type"
                value={form.ticketType}
              />

              <TextField
                helperText="Optional notes such as transfer rules, premium perks, or special wording."
                label="Additional Ticket Info"
                multiline
                onChangeText={(value) => updateField('additionalTicketInfo', value)}
                placeholder="e.g. Includes lounge access and mobile transfer only"
                value={form.additionalTicketInfo}
              />
            </FormSection>

            <FormSection
              description="Anything the ticket holder should know before arriving."
              title="Additional Info"
            >
              <TextField
                error={errors.entryInfo}
                helperText="Explain gate, check-in, age limits, or anything important for entry."
                label="Entry Info"
                multiline
                onChangeText={(value) => updateField('entryInfo', value)}
                placeholder="e.g. Enter through Gate C with a matching photo ID"
                value={form.entryInfo}
              />
            </FormSection>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <View style={[styles.footerShell, { paddingBottom: footerPadding }]}>
        {draftSavedAt ? (
          <Text style={styles.footerNote}>{`Draft saved at ${formatSavedTime(draftSavedAt)}`}</Text>
        ) : (
          <Text style={styles.footerNote}>
            Save progress, preview everything, or add the event when it looks right.
          </Text>
        )}

        <View style={styles.footerActions}>
          <ActionButton label="Save Draft" onPress={handleSaveDraft} variant="secondary" />
          <ActionButton label="Preview" onPress={handlePreview} variant="secondary" />
          <ActionButton label="Add Event" onPress={handleAddEvent} variant="primary" />
        </View>
      </View>

      <CalendarPickerModal
        title={activeDateField === 'purchaseDate' ? 'Select Purchase Date' : 'Select Event Date'}
        value={activeDateField ? form[activeDateField] : null}
        visible={Boolean(activeDateField)}
        onClose={() => setActiveDateField(null)}
        onConfirm={(value) => {
          if (activeDateField) {
            updateField(activeDateField, value);
          }
          setActiveDateField(null);
        }}
      />

      <TimePickerModal
        value={form.time}
        visible={timePickerVisible}
        onClose={() => setTimePickerVisible(false)}
        onConfirm={(value) => {
          updateField('time', value);
          setTimePickerVisible(false);
        }}
      />

      <OptionPickerModal
        options={TICKET_TYPE_OPTIONS}
        title="Choose Ticket Type"
        value={form.ticketType}
        visible={ticketTypeVisible}
        onClose={() => setTicketTypeVisible(false)}
        onSelect={(value) => {
          updateField('ticketType', value);
          setTicketTypeVisible(false);
        }}
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

function FormSection({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionDescription}>{description}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function FieldShell({
  children,
  error,
  helperText,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  helperText?: string;
  label: string;
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      <Text style={[styles.fieldHelper, error && styles.fieldHelperError]}>
        {error ?? helperText ?? ' '}
      </Text>
    </View>
  );
}

function TextField({
  error,
  helperText,
  label,
  multiline,
  ...props
}: React.ComponentProps<typeof TextInput> & {
  error?: string;
  helperText?: string;
  label: string;
}) {
  return (
    <FieldShell error={error} helperText={helperText} label={label}>
      <TextInput
        placeholderTextColor={ticketColors.textSubtle}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          error && styles.inputError,
        ]}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...props}
      />
    </FieldShell>
  );
}

function PickerField({
  error,
  helperText,
  label,
  onPress,
  placeholder,
  value,
}: {
  error?: string;
  helperText?: string;
  label: string;
  onPress: () => void;
  placeholder: string;
  value: string;
}) {
  return (
    <FieldShell error={error} helperText={helperText} label={label}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={[styles.pickerField, error && styles.inputError]}
      >
        <Text style={[styles.pickerValue, !value && styles.pickerPlaceholder]}>
          {value || placeholder}
        </Text>
        <Ionicons color={ticketColors.textSubtle} name="chevron-down" size={18} />
      </Pressable>
    </FieldShell>
  );
}

function ActionButton({
  label,
  onPress,
  variant,
}: {
  label: string;
  onPress: () => void;
  variant: 'primary' | 'secondary';
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.actionButton,
        variant === 'primary' ? styles.actionButtonPrimary : styles.actionButtonSecondary,
      ]}
    >
      <Text
        style={[
          styles.actionButtonText,
          variant === 'primary'
            ? styles.actionButtonTextPrimary
            : styles.actionButtonTextSecondary,
        ]}
      >
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
  root: {
    backgroundColor: ticketColors.backgroundDeep,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: ticketSpacing.md,
    paddingHorizontal: ticketSpacing.md,
    paddingTop: ticketSpacing.lg,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: ticketSpacing.md,
    paddingBottom: ticketSpacing.xs,
  },
  headerIcon: {
    alignItems: 'center',
    backgroundColor: ticketColors.primarySoft,
    borderRadius: ticketRadii.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  headerCloseButton: {
    alignItems: 'center',
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.pill,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  eyebrow: {
    color: ticketColors.primaryBright,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  title: {
    color: ticketColors.text,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 34,
  },
  subtitle: {
    color: ticketColors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  adminNotice: {
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: ticketSpacing.sm,
    padding: ticketSpacing.md,
  },
  adminNoticeIcon: {
    alignItems: 'center',
    backgroundColor: ticketColors.primarySoft,
    borderRadius: ticketRadii.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  adminNoticeCopy: {
    flex: 1,
    gap: 2,
  },
  adminNoticeTitle: {
    color: ticketColors.text,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  adminNoticeBody: {
    color: ticketColors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  sectionCard: {
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    gap: ticketSpacing.md,
    padding: ticketSpacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    color: ticketColors.text,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 22,
  },
  sectionDescription: {
    color: ticketColors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  sectionBody: {
    gap: ticketSpacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: ticketSpacing.sm,
  },
  rowField: {
    flex: 1,
  },
  fieldBlock: {
    gap: 6,
  },
  fieldLabel: {
    color: ticketColors.text,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  fieldHelper: {
    color: ticketColors.textSubtle,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    minHeight: 16,
  },
  fieldHelperError: {
    color: '#C93A2D',
  },
  input: {
    backgroundColor: ticketColors.chromeElevated,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    color: ticketColors.text,
    fontSize: 14,
    fontWeight: '600',
    minHeight: 52,
    paddingHorizontal: ticketSpacing.sm,
  },
  inputMultiline: {
    minHeight: 108,
    paddingTop: ticketSpacing.sm,
  },
  inputError: {
    borderColor: '#C93A2D',
  },
  pickerField: {
    alignItems: 'center',
    backgroundColor: ticketColors.chromeElevated,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: ticketSpacing.sm,
  },
  pickerValue: {
    color: ticketColors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    paddingRight: ticketSpacing.sm,
  },
  pickerPlaceholder: {
    color: ticketColors.textSubtle,
  },
  imageFieldCard: {
    backgroundColor: ticketColors.chromeElevated,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  uploadedImagePreview: {
    height: 188,
    width: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    gap: ticketSpacing.xs,
    justifyContent: 'center',
    minHeight: 188,
    paddingHorizontal: ticketSpacing.lg,
    paddingVertical: ticketSpacing.lg,
  },
  imagePlaceholderIcon: {
    alignItems: 'center',
    backgroundColor: ticketColors.primarySoft,
    borderRadius: ticketRadii.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  imagePlaceholderTitle: {
    color: ticketColors.text,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
    textAlign: 'center',
  },
  imagePlaceholderBody: {
    color: ticketColors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
  },
  imageMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: ticketSpacing.sm,
    padding: ticketSpacing.sm,
  },
  imageMetaCopy: {
    flex: 1,
    gap: 2,
  },
  imageMetaTitle: {
    color: ticketColors.text,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  imageMetaBody: {
    color: ticketColors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  imageActionRow: {
    flexDirection: 'row',
    gap: ticketSpacing.sm,
    marginTop: ticketSpacing.xs,
  },
  imageActionButton: {
    alignItems: 'center',
    borderRadius: ticketRadii.md,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: ticketSpacing.md,
  },
  imageActionButtonPrimary: {
    backgroundColor: ticketColors.primary,
    flex: 1,
  },
  imageActionButtonDisabled: {
    opacity: 0.72,
  },
  imageActionButtonSecondary: {
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.borderStrong,
    borderWidth: 1,
  },
  imageActionButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  imageActionButtonSecondaryText: {
    color: ticketColors.text,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  footerShell: {
    backgroundColor: 'rgba(248, 250, 252, 0.98)',
    borderTopColor: ticketColors.borderStrong,
    borderTopWidth: StyleSheet.hairlineWidth,
    bottom: 0,
    gap: ticketSpacing.sm,
    left: 0,
    paddingHorizontal: ticketSpacing.md,
    paddingTop: ticketSpacing.sm,
    position: 'absolute',
    right: 0,
  },
  footerNote: {
    color: ticketColors.textSubtle,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  footerActions: {
    flexDirection: 'row',
    gap: ticketSpacing.xs,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: ticketRadii.md,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: ticketSpacing.sm,
  },
  actionButtonPrimary: {
    backgroundColor: ticketColors.primary,
    shadowColor: ticketColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  actionButtonSecondary: {
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.borderStrong,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  actionButtonTextPrimary: {
    color: '#FFFFFF',
  },
  actionButtonTextSecondary: {
    color: ticketColors.text,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(15, 23, 42, 0.32)',
    flex: 1,
    justifyContent: 'flex-end',
    padding: ticketSpacing.md,
  },
  modalSafeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: ticketColors.chrome,
    borderRadius: ticketRadii.md,
    maxHeight: '90%',
    padding: ticketSpacing.md,
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalEyebrow: {
    color: ticketColors.primaryBright,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  modalTitle: {
    color: ticketColors.text,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 24,
    marginTop: 2,
  },
  modalCloseButton: {
    alignItems: 'center',
    backgroundColor: ticketColors.chromeElevated,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.pill,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  previewContent: {
    gap: ticketSpacing.sm,
    paddingBottom: ticketSpacing.md,
    paddingTop: ticketSpacing.md,
  },
  previewHeroImage: {
    borderRadius: ticketRadii.md,
    height: 180,
    width: '100%',
  },
  previewSection: {
    backgroundColor: ticketColors.chromeElevated,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    gap: ticketSpacing.xs,
    padding: ticketSpacing.sm,
  },
  previewSectionTitle: {
    color: ticketColors.text,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  previewRow: {
    gap: 2,
  },
  previewLabel: {
    color: ticketColors.textSubtle,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
    textTransform: 'uppercase',
  },
  previewValue: {
    color: ticketColors.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  modalActions: {
    flexDirection: 'row',
    gap: ticketSpacing.sm,
  },
  sheetCard: {
    backgroundColor: ticketColors.chrome,
    borderRadius: ticketRadii.md,
    padding: ticketSpacing.md,
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ticketSpacing.sm,
  },
  sheetTitle: {
    color: ticketColors.text,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 22,
  },
  sheetOptions: {
    gap: ticketSpacing.xs,
    marginBottom: ticketSpacing.sm,
  },
  optionRow: {
    alignItems: 'center',
    backgroundColor: ticketColors.chromeElevated,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: ticketSpacing.sm,
  },
  optionRowActive: {
    borderColor: ticketColors.primary,
    backgroundColor: ticketColors.primarySoft,
  },
  optionText: {
    color: ticketColors.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  optionTextActive: {
    color: ticketColors.primaryBright,
  },
  timeGrid: {
    flexDirection: 'row',
    gap: ticketSpacing.sm,
    marginBottom: ticketSpacing.md,
  },
  timeColumn: {
    flex: 1,
  },
  timeColumnLabel: {
    color: ticketColors.textSubtle,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
    marginBottom: ticketSpacing.xs,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  timeColumnScroll: {
    maxHeight: 220,
  },
  timeOptionList: {
    gap: ticketSpacing.xs,
  },
  timeOption: {
    alignItems: 'center',
    backgroundColor: ticketColors.chromeElevated,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    minHeight: 42,
    justifyContent: 'center',
  },
  timeOptionActive: {
    backgroundColor: ticketColors.primarySoft,
    borderColor: ticketColors.primary,
  },
  timeOptionText: {
    color: ticketColors.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  timeOptionTextActive: {
    color: ticketColors.primaryBright,
  },
  calendarCard: {
    backgroundColor: ticketColors.chrome,
    borderRadius: ticketRadii.md,
    padding: ticketSpacing.md,
  },
  calendarHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ticketSpacing.sm,
  },
  monthButton: {
    alignItems: 'center',
    backgroundColor: ticketColors.chromeElevated,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.pill,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  calendarMonthLabel: {
    color: ticketColors.text,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
  },
  dayLabelRow: {
    flexDirection: 'row',
    marginBottom: ticketSpacing.xs,
  },
  dayLabel: {
    color: ticketColors.textSubtle,
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: ticketSpacing.md,
  },
  dateCell: {
    alignItems: 'center',
    borderRadius: ticketRadii.md,
    height: 40,
    justifyContent: 'center',
    marginBottom: ticketSpacing.xs,
    width: '14.28%',
  },
  dateCellActive: {
    backgroundColor: ticketColors.primary,
  },
  dateCellText: {
    color: ticketColors.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  dateCellTextActive: {
    color: '#FFFFFF',
  },
  dateCellBlank: {
    height: 40,
    marginBottom: ticketSpacing.xs,
    width: '14.28%',
  },
});
