import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useEffect, useMemo, useState } from 'react';
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
  WebImageCropper,
  type WebCroppedImage,
  type WebImageCropperHandle,
} from '@/components/admin/web-image-cropper';
import { DEFAULT_TRANSFER_SENDER_NAME } from '@/constants/admin-settings';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import {
  buildVenueGeocodeQuery,
  geocodeVenueLocation,
} from '@/lib/geocoding';
import { uploadImage } from '@/lib/image-upload';
import {
  TICKET_STATUS_OPTIONS,
  TICKET_TYPE_OPTIONS,
  type TicketInput,
  type TicketStatus,
  type TicketType,
  useTicketStore,
} from '@/store/ticketStore';
import { useAppStore } from '@/store/use-app-store';

type TicketFormInput = Omit<
  TicketInput,
  'isHidden' | 'latitude' | 'longitude' | 'venueAddress' | 'venuePlaceId'
> & {
  latitude: string;
  longitude: string;
  venueAddress: string;
  venuePlaceId: string;
};
type FormState = Record<keyof TicketFormInput, string>;
type FieldKey = keyof FormState;

const fieldLabels: Record<FieldKey, string> = {
  eventName: 'Event Name',
  artistName: 'Artist Name',
  albumName: 'Album Name',
  venue: 'Venue',
  venueAddress: 'Venue Address',
  city: 'City',
  state: 'State',
  country: 'Country',
  latitude: 'Latitude',
  longitude: 'Longitude',
  venuePlaceId: 'Venue Place ID',
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
  transferSenderName: 'Transfer Sender Name',
  image: 'Image URL',
  backgroundColor: 'Accent Color',
  seatLabel: 'Seat Label',
  ticketNote: 'Ticket Note',
  authPhoneNumber: 'Auth Phone Number',
};

const requiredFields: FieldKey[] = [];
const locationSourceFields = new Set<FieldKey>([
  'city',
  'country',
  'state',
  'venue',
  'venueAddress',
]);

const EMPTY_CREATE_FORM: FormState = {
  eventName: '',
  artistName: '',
  albumName: '',
  venue: '',
  venueAddress: '',
  city: '',
  state: '',
  country: '',
  latitude: '',
  longitude: '',
  venuePlaceId: '',
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
  transferSenderName: DEFAULT_TRANSFER_SENDER_NAME,
  image: '',
  backgroundColor: '#B79E6A',
  seatLabel: '',
  ticketNote: '',
  authPhoneNumber: '******2970',
};

export function AddEventAdminScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const imageCropperRef = useRef<WebImageCropperHandle | null>(null);
  const params = useLocalSearchParams<{ mode?: string; ticketId?: string }>();
  const mode = params.mode === 'edit' ? 'edit' : 'create';
  const ticketId = typeof params.ticketId === 'string' ? params.ticketId : undefined;
  const transferSenderName = useAppStore((state) => state.transferSenderName);
  const createFormTransferSenderNameRef = useRef(transferSenderName);
  const addEvent = useTicketStore((state) => state.addEvent);
  const updateEvent = useTicketStore((state) => state.updateEvent);
  const selectedTicket = useTicketStore((state) =>
    ticketId ? state.tickets.find((ticket) => ticket.id === ticketId) : undefined,
  );
  const [form, setForm] = useState<FormState>(() =>
    selectedTicket
      ? toFormState(selectedTicket)
      : createEmptyCreateForm(createFormTransferSenderNameRef.current),
  );
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [isResolvingVenue, setIsResolvingVenue] = useState(false);
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
      setForm(createEmptyCreateForm(createFormTransferSenderNameRef.current));
      setErrors({});
    }
  }, [mode, selectedTicket]);

  const previewTitle = useMemo(
    () => `${form.ticketType || 'Ticket'} / ${form.status || 'upcoming'}`,
    [form.status, form.ticketType],
  );
  const hasResolvedVenueLocation = hasFormCoordinates(form);

  function handleLeaveAdminForm() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/admin');
  }

  function updateField(key: FieldKey, value: string) {
    setForm((current) => {
      const next = { ...current, [key]: value };

      if (locationSourceFields.has(key) && current[key] !== value) {
        next.latitude = '';
        next.longitude = '';
        next.venuePlaceId = '';
      }

      return next;
    });
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

    try {
      setIsSaving(true);
      const payload = await buildTicketPayloadForSave(form, (nextForm) => {
        setForm(nextForm);
        setErrors((current) => {
          const next = { ...current };
          delete next.latitude;
          delete next.longitude;
          delete next.venueAddress;
          return next;
        });
      });

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
      if (isVenueLookupError(error)) {
        Alert.alert('Location lookup failed', getVenueLookupErrorMessage(error));
      } else {
        Alert.alert(
          'Save failed',
          getTicketSaveErrorMessage(error),
        );
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleResolveVenueLocation() {
    if (isResolvingVenue) {
      return;
    }

    try {
      setIsResolvingVenue(true);
      const nextForm = await resolveVenueLocationForForm(form);
      setForm(nextForm);
      setErrors((current) => {
        const next = { ...current };
        delete next.latitude;
        delete next.longitude;
        delete next.venueAddress;
        return next;
      });
      showToast('Venue location matched');
    } catch (error) {
      console.warn('Venue lookup failed.', error);
      Alert.alert('Location lookup failed', getVenueLookupErrorMessage(error));
    } finally {
      setIsResolvingVenue(false);
    }
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 1800);
  }

  function handlePickImage() {
    if (isPickingImage) {
      return;
    }

    if (Platform.OS !== 'web') {
      Alert.alert('Image upload unavailable', 'Image upload is available in the web/PWA app.');
      return;
    }

    imageCropperRef.current?.openFileDialog();
  }

  function openImageCropper(sourceUri = form.image.trim()) {
    imageCropperRef.current?.openSource(sourceUri);
  }

  async function handleCroppedImage(image: WebCroppedImage) {
    try {
      const imageUrl = await uploadTicketArtworkImage(image);

      updateField('image', imageUrl);
      showToast('Image uploaded');
    } catch (error) {
      console.warn('Image upload failed.', error);
      throw new Error(getTicketImageUploadErrorMessage(error));
    }
  }

  if (mode === 'edit' && ticketId && !selectedTicket) {
    return (
      <SafeAreaView style={styles.root}>
      <Head>
        <meta name="theme-color" content="#F5F6F8" />
        <meta name="color-scheme" content="light" />
      </Head>
      <StatusBar style="dark" backgroundColor="#F5F6F8" />
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
      <Head>
        <meta name="theme-color" content="#F5F6F8" />
        <meta name="color-scheme" content="light" />
      </Head>
      <StatusBar style="dark" backgroundColor="#F5F6F8" />
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
            {Platform.OS === 'web' && form.image ? (
              <Pressable onPress={() => openImageCropper()} style={styles.imageDressButton}>
                <Ionicons color="#005BD3" name="crop-outline" size={16} />
                <Text style={styles.imageDressButtonText}>Crop Image</Text>
              </Pressable>
            ) : null}
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
            <TicketTextField
              error={errors.venueAddress}
              label="Venue Address"
              onChangeText={(value) => updateField('venueAddress', value)}
              placeholder="Street address, venue address, or landmark"
              value={form.venueAddress}
            />
            <View style={styles.row}>
              <TicketTextField error={errors.city} label="City" onChangeText={(value) => updateField('city', value)} value={form.city} />
              <TicketTextField error={errors.state} label="State" onChangeText={(value) => updateField('state', value)} value={form.state} />
            </View>
            <TicketTextField error={errors.country} label="Country" onChangeText={(value) => updateField('country', value)} value={form.country} />
            <View style={styles.locationActionRow}>
              <Pressable
                disabled={isResolvingVenue || isSaving}
                onPress={() => {
                  void handleResolveVenueLocation();
                }}
                style={[
                  styles.locationLookupButton,
                  (isResolvingVenue || isSaving) && styles.buttonDisabled,
                ]}
              >
                {isResolvingVenue ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Ionicons color="#FFFFFF" name="location-outline" size={16} />
                )}
                <Text style={styles.locationLookupButtonText}>
                  {isResolvingVenue ? 'Finding Location' : 'Find Location'}
                </Text>
              </Pressable>
              {hasResolvedVenueLocation ? (
                <Pressable
                  onPress={() => {
                    updateField('latitude', '');
                    updateField('longitude', '');
                    updateField('venuePlaceId', '');
                  }}
                  style={styles.clearLocationButton}
                >
                  <Ionicons color="#6B7280" name="close" size={16} />
                </Pressable>
              ) : null}
            </View>
            {hasResolvedVenueLocation ? (
              <View style={styles.locationStatus}>
                <Ionicons color="#15803D" name="checkmark-circle" size={16} />
                <Text style={styles.locationStatusText}>
                  {`${formatCoordinateForDisplay(form.latitude)}, ${formatCoordinateForDisplay(form.longitude)}`}
                </Text>
              </View>
            ) : null}
            <View style={styles.row}>
              <TicketTextField
                error={errors.latitude}
                keyboardType="numbers-and-punctuation"
                label="Latitude"
                onChangeText={(value) => updateField('latitude', value)}
                placeholder="6.426747"
                value={form.latitude}
              />
              <TicketTextField
                error={errors.longitude}
                keyboardType="numbers-and-punctuation"
                label="Longitude"
                onChangeText={(value) => updateField('longitude', value)}
                placeholder="3.430099"
                value={form.longitude}
              />
            </View>
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
            <TicketTextField error={errors.authPhoneNumber} label="Auth Phone Number" onChangeText={(value) => updateField('authPhoneNumber', value)} placeholder="e.g. ******2970" value={form.authPhoneNumber} />
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

      <WebImageCropper
        aspect={16 / 9}
        onCroppedImage={handleCroppedImage}
        onError={(message) => Alert.alert('Could not process image', message)}
        onProcessingChange={setIsPickingImage}
        outputHeight={788}
        outputWidth={1400}
        ref={imageCropperRef}
      />

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
  keyboardType,
  label,
  multiline,
  onChangeText,
  placeholder,
  value,
}: {
  error?: string;
  keyboardType?: React.ComponentProps<typeof TextInput>['keyboardType'];
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
        keyboardType={keyboardType}
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

  const latitudeError = getCoordinateValidationError(form.latitude, 'Latitude', -90, 90);
  const longitudeError = getCoordinateValidationError(form.longitude, 'Longitude', -180, 180);

  if (latitudeError) {
    errors.latitude = latitudeError;
  }

  if (longitudeError) {
    errors.longitude = longitudeError;
  }

  if (
    (form.latitude.trim() && !form.longitude.trim()) ||
    (!form.latitude.trim() && form.longitude.trim())
  ) {
    errors.latitude = errors.latitude ?? 'Latitude and longitude must be saved together.';
    errors.longitude = errors.longitude ?? 'Latitude and longitude must be saved together.';
  }

  return errors;
}

function createEmptyCreateForm(transferSenderName: string): FormState {
  return {
    ...EMPTY_CREATE_FORM,
    transferSenderName:
      transferSenderName.trim() || DEFAULT_TRANSFER_SENDER_NAME,
  };
}

function toFormState(ticket: TicketInput): FormState {
  const { isHidden: _isHidden, ...formState } = ticket;

  return {
    ...EMPTY_CREATE_FORM,
    ...formState,
    authPhoneNumber: formState.authPhoneNumber ?? EMPTY_CREATE_FORM.authPhoneNumber,
    transferSenderName:
      formState.transferSenderName?.trim() || DEFAULT_TRANSFER_SENDER_NAME,
    latitude: formatCoordinateField(formState.latitude),
    longitude: formatCoordinateField(formState.longitude),
    venueAddress: formState.venueAddress ?? buildFormVenueAddress(formState),
    venuePlaceId: formState.venuePlaceId ?? '',
  };
}

function toTicketInput(form: FormState): TicketInput {
  const {
    latitude: latitudeValue,
    longitude: longitudeValue,
    venueAddress,
    venuePlaceId,
    ...ticketFields
  } = form;

  return {
    ...ticketFields,
    latitude: parseCoordinateField(latitudeValue),
    longitude: parseCoordinateField(longitudeValue),
    ticketType: form.ticketType as TicketType,
    status: form.status as TicketStatus,
    venueAddress: venueAddress.trim() || buildFormVenueAddress(form),
    venuePlaceId: venuePlaceId.trim(),
  };
}

async function buildTicketPayloadForSave(
  form: FormState,
  onVenueResolved: (nextForm: FormState) => void,
) {
  if (hasFormCoordinates(form) || !buildVenueGeocodeQuery(getVenueGeocodeInput(form))) {
    return toTicketInput(form);
  }

  try {
    const nextForm = await resolveVenueLocationForForm(form);
    onVenueResolved(nextForm);
    return toTicketInput(nextForm);
  } catch (error) {
    throw toVenueLookupError(error);
  }
}

async function resolveVenueLocationForForm(form: FormState): Promise<FormState> {
  const location = await geocodeVenueLocation(getVenueGeocodeInput(form));

  return {
    ...form,
    latitude: formatCoordinateField(location.latitude),
    longitude: formatCoordinateField(location.longitude),
    venueAddress: location.formattedAddress,
    venuePlaceId: location.placeId ?? form.venuePlaceId,
  };
}

function getVenueGeocodeInput(form: FormState) {
  return {
    address: form.venueAddress,
    city: form.city,
    country: form.country,
    state: form.state,
    venue: form.venue,
  };
}

function hasFormCoordinates(form: FormState) {
  return (
    parseCoordinateField(form.latitude) !== null &&
    parseCoordinateField(form.longitude) !== null
  );
}

function parseCoordinateField(value: string | number | null | undefined) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return null;
  }

  const coordinate = Number(trimmedValue);
  return Number.isFinite(coordinate) ? coordinate : null;
}

function formatCoordinateField(value: string | number | null | undefined) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(Number(value.toFixed(7)));
  }

  if (typeof value === 'string') {
    return value;
  }

  return '';
}

function formatCoordinateForDisplay(value: string) {
  return parseCoordinateField(value)?.toFixed(6) ?? value;
}

function getCoordinateValidationError(
  value: string,
  label: string,
  min: number,
  max: number,
) {
  if (!value.trim()) {
    return undefined;
  }

  const coordinate = parseCoordinateField(value);

  if (coordinate === null) {
    return `${label} must be a number.`;
  }

  if (coordinate < min || coordinate > max) {
    return `${label} must be between ${min} and ${max}.`;
  }

  return undefined;
}

function buildFormVenueAddress(
  form: Pick<TicketInput, 'city' | 'country' | 'state' | 'venue'>,
) {
  return [form.venue, form.city, form.state, form.country]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');
}

const VENUE_LOOKUP_ERROR_PREFIX = 'VENUE_LOOKUP_FAILED: ';

function toVenueLookupError(error: unknown) {
  return new Error(`${VENUE_LOOKUP_ERROR_PREFIX}${getVenueLookupErrorMessage(error)}`);
}

function isVenueLookupError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.startsWith(VENUE_LOOKUP_ERROR_PREFIX)
  );
}

function getVenueLookupErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  const normalizedMessage = message.startsWith(VENUE_LOOKUP_ERROR_PREFIX)
    ? message.slice(VENUE_LOOKUP_ERROR_PREFIX.length)
    : message;

  return (
    normalizedMessage ||
    'We could not match that venue to a map location. Check the venue/address and try again.'
  );
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

async function uploadTicketArtworkImage(image: WebCroppedImage) {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary upload is not configured.');
  }

  return uploadImage(image.file, {
    cloudName,
    fileName: image.fileName,
    folder: 'ticketmaster-rey/tickets',
    publicId: buildTicketArtworkPublicId(image.fileName),
    uploadPreset,
  });
}

function buildTicketArtworkPublicId(fileName: string) {
  const safeName = fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9-]+/gi, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase();

  return `ticket-artwork-${safeName || 'image'}-${Date.now()}`;
}

function getTicketImageUploadErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : '';

  if (message.toLowerCase().includes('cloudinary')) {
    return 'Image upload is not configured. Add a Cloudinary unsigned upload preset, or paste an Image URL.';
  }

  return 'The cropped image could not be uploaded. Check your connection and try again.';
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
  imageDressButton: {
    alignItems: 'center',
    borderColor: '#BFDBFE',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 42,
  },
  imageDressButtonText: {
    color: '#005BD3',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  locationActionRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  locationLookupButton: {
    alignItems: 'center',
    backgroundColor: '#005BD3',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 44,
  },
  locationLookupButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  clearLocationButton: {
    alignItems: 'center',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  locationStatus: {
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  locationStatusText: {
    color: '#166534',
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
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
