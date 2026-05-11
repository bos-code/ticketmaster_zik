import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ScreenWrapper } from "@/components/ui/screen-wrapper";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  LinearTransition,
} from "react-native-reanimated";
import Head from "expo-router/head";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { VenueMapCard } from "@/components/events/venue-map-card";
import {
  ticketColors,
  ticketRadii,
  ticketSpacing,
} from "@/constants/ticket-theme";
import {
  formatCurrency,
  type EventSeatOption,
  type EventSeatSection,
} from "@/lib/data";
import {
  selectEventById,
  selectTicketReservationById,
  useEventStore,
} from "@/store/use-event-store";

type FlowStep = "detail" | "seats" | "review" | "confirmation";

const MAX_RESERVED_SEATS = 3;

export function EventReservationFlow({ eventId }: { eventId: string }) {
  const insets = useSafeAreaInsets();
  const event = useEventStore((state) => selectEventById(state, eventId));
  const reserveTickets = useEventStore((state) => state.reserveTickets);
  const { height } = useWindowDimensions();

  const [step, setStep] = useState<FlowStep>("detail");
  const [focusedSectionId, setFocusedSectionId] = useState(
    event?.seatSections[0]?.id ?? "",
  );
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [seatLimitMessage, setSeatLimitMessage] = useState<string | null>(null);
  const [confirmedReservationId, setConfirmedReservationId] = useState<string | null>(null);
  const [isConfirmingReservation, setIsConfirmingReservation] = useState(false);
  const confirmedReservation = useEventStore((state) =>
    confirmedReservationId
      ? selectTicketReservationById(state, confirmedReservationId)
      : undefined,
  );

  useEffect(() => {
    if (!event?.seatSections.length) {
      return;
    }

    if (!event.seatSections.some((section) => section.id === focusedSectionId)) {
      setFocusedSectionId(event.seatSections[0]?.id ?? "");
    }
  }, [event, focusedSectionId]);

  if (!event) {
    return <ReservationNotFound />;
  }

  const firstSectionId = event.seatSections[0]?.id ?? "";
  const focusedSection =
    event.seatSections.find((section) => section.id === focusedSectionId) ??
    event.seatSections[0];
  const visibleSeats = event.seatOptions.filter(
    (seat) => seat.sectionId === focusedSection.id,
  );
  const selectedSeats = event.allSeatOptions.filter((seat) =>
    selectedSeatIds.includes(seat.id),
  );
  const isPastEvent = new Date(event.startsAt).getTime() < Date.now();
  const reservationTotal = selectedSeats.reduce(
    (sum, seat) => sum + seat.price,
    0,
  );
  const reservationCode = confirmedReservation?.reservationCode ?? `RSV-${event.id
    .replace(/-/g, "")
    .slice(0, 6)
    .toUpperCase()}-${String(selectedSeats.length).padStart(2, "0")}`;
  const stepIndex =
    step === "detail" ? 1 : step === "seats" ? 2 : step === "review" ? 3 : 4;

  function handleBack() {
    if (step === "detail") {
      router.back();
      return;
    }

    if (step === "confirmation") {
      setStep("review");
      return;
    }

    setStep(step === "review" ? "seats" : "detail");
  }

  function handleSelectSeat(seatId: string) {
    if (selectedSeatIds.includes(seatId)) {
      setSelectedSeatIds((current) => current.filter((value) => value !== seatId));
      setSeatLimitMessage(null);
      return;
    }

    if (selectedSeatIds.length >= MAX_RESERVED_SEATS) {
      setSeatLimitMessage(
        `You can reserve up to ${MAX_RESERVED_SEATS} seats in one reservation.`,
      );
      return;
    }

    setSelectedSeatIds((current) => [...current, seatId]);
    setSeatLimitMessage(null);
  }

  function handleRestartFlow() {
    setStep("detail");
    setFocusedSectionId(firstSectionId);
    setSelectedSeatIds([]);
    setSeatLimitMessage(null);
    setConfirmedReservationId(null);
  }

  function handleFocusSection(sectionId: string) {
    setFocusedSectionId(sectionId);
    setSeatLimitMessage(null);
  }

  async function handleConfirmReservation() {
    if (!event || isConfirmingReservation) {
      return;
    }

    try {
      setIsConfirmingReservation(true);
      const reservation = await reserveTickets({
        eventId: event.id,
        reservationId: confirmedReservationId ?? undefined,
        seatIds: selectedSeatIds,
      });

      if (!reservation) {
        return;
      }

      setConfirmedReservationId(reservation.id);
      setStep("confirmation");
    } catch {
      Alert.alert(
        "Reservation failed",
        "We could not save this reservation to Firebase right now. Please try again.",
      );
    } finally {
      setIsConfirmingReservation(false);
    }
  }

  const header = (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        hitSlop={8}
        onPress={handleBack}
        style={styles.backButton}
      >
        <Ionicons color={ticketColors.text} name="arrow-back" size={20} />
      </Pressable>

      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>{`Step ${stepIndex} of 4`}</Text>
      </View>
    </View>
  );

  const hero = (
    <EventHero
      city={event.city}
      date={event.date}
      imageUrl={event.imageUrl}
      title={event.title}
      venue={event.venue}
    />
  );

  if (step === "seats") {
    return (
      <ScreenWrapper backgroundColor={ticketColors.background}>
      <Head>
        <meta name="theme-color" content={ticketColors.background} />
        <meta name="color-scheme" content="light" />
      </Head>
      <StatusBar backgroundColor={ticketColors.background} style="dark" />
        {header}

        <Animated.View
          entering={FadeInDown.duration(220)}
          key={step}
          layout={LinearTransition.springify().damping(18).stiffness(180)}
          style={[styles.stepContainer, styles.seatStepContainer]}
        >
          {hero}

          <SeatSelectionStep
            focusedSection={focusedSection}
            onContinue={() => setStep("review")}
            onFocusSection={handleFocusSection}
            onSelectSeat={handleSelectSeat}
            reservationTotal={reservationTotal}
            sections={event.seatSections}
            seatLimitMessage={seatLimitMessage}
            selectedSeatCount={selectedSeatIds.length}
            selectedSeatIds={selectedSeatIds}
            visibleSeats={visibleSeats}
          />
        </Animated.View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper backgroundColor={ticketColors.background}>
      <Head>
        <meta name="theme-color" content={ticketColors.background} />
        <meta name="color-scheme" content="light" />
      </Head>
      <StatusBar backgroundColor={ticketColors.background} style="dark" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          step === "detail" && { flexGrow: 1, minHeight: height },
        ]}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        {header}

        <Animated.View
          entering={FadeInDown.duration(220)}
          key={step}
          layout={LinearTransition.springify().damping(18).stiffness(180)}
          style={[
            styles.stepContainer,
            step === "detail" && styles.stepContainerFill,
          ]}
        >
          {hero}

          {step === "detail" ? (
            <DetailStep
              description={event.description}
              eventId={event.id}
              highlights={event.highlights}
              isPastEvent={isPastEvent}
              onChooseSeats={() => setStep("seats")}
              priceFrom={event.priceFrom}
              venueAddress={event.venueAddress}
              venueName={event.venue}
              venueSummary={event.venueSummary}
              latitude={event.latitude}
              longitude={event.longitude}
            />
          ) : null}

          {step === "review" ? (
            <ReviewStep
              eventDate={event.date}
              eventTitle={event.title}
              eventVenue={event.venue}
              isSubmitting={isConfirmingReservation}
              onConfirm={() => {
                void handleConfirmReservation();
              }}
              onEditSeats={() => setStep("seats")}
              reservationNote={event.reservationNote}
              reservationTotal={reservationTotal}
              selectedSeats={selectedSeats}
            />
          ) : null}

          {step === "confirmation" ? (
            <ConfirmationStep
              city={event.city}
              date={event.date}
              onViewMyTickets={() => router.replace("/my-tickets")}
              onReserveMore={handleRestartFlow}
              reservationCode={reservationCode}
              reservationTotal={reservationTotal}
              selectedSeats={selectedSeats}
              title={event.title}
              venue={event.venue}
            />
          ) : null}
        </Animated.View>
      </ScrollView>
    </ScreenWrapper>
  );
}

function ReservationNotFound() {
  return (
    <ScreenWrapper backgroundColor={ticketColors.background}>
      <View style={styles.notFoundWrap}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons color={ticketColors.text} name="arrow-back" size={20} />
        </Pressable>

        <View style={styles.notFoundCard}>
          <Text style={styles.notFoundEyebrow}>Event Missing</Text>
          <Text style={styles.notFoundTitle}>
            We couldn&apos;t find that event.
          </Text>
          <Text style={styles.notFoundBody}>
            Head back to discovery and choose another event card to reserve
            seats.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/discover")}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Back to Discover</Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
}

function EventHero({
  city,
  date,
  imageUrl,
  title,
  venue,
}: {
  city: string;
  date: string;
  imageUrl: string;
  title: string;
  venue: string;
}) {
  return (
    <View style={styles.heroCard}>
      <Image
        contentFit="cover"
        source={{ uri: imageUrl }}
        style={styles.heroImage}
      />
      <View style={styles.heroOverlay} />

      <View style={styles.heroContent}>
        <Text style={styles.heroDate}>{date}</Text>
        <Text style={styles.heroTitle}>{title}</Text>
        <Text style={styles.heroVenue}>{`${venue} - ${city}`}</Text>
      </View>
    </View>
  );
}

function DetailStep({
  description,
  eventId,
  highlights,
  isPastEvent,
  latitude,
  longitude,
  onChooseSeats,
  priceFrom,
  venueAddress,
  venueName,
  venueSummary,
}: {
  description: string;
  eventId: string;
  highlights: string[];
  isPastEvent: boolean;
  latitude?: number | null;
  longitude?: number | null;
  onChooseSeats: () => void;
  priceFrom: number;
  venueAddress?: string;
  venueName: string;
  venueSummary?: string;
}) {
  return (
    <View style={[styles.sectionWrap, styles.detailSectionWrap]}>
      <Animated.View entering={FadeInUp.duration(220)} style={styles.metricRow}>
        <MetricCard
          label="Reservation opens at"
          value={`From ${formatCurrency(priceFrom)}`}
        />
        <MetricCard label="Hold window" value="15 min" />
      </Animated.View>

      <Animated.View
        entering={FadeInUp.duration(240)}
        style={styles.contentCard}
      >
        <Text style={styles.cardEyebrow}>Event Detail</Text>
        <Text style={styles.cardTitle}>
          Reserve seats in the current Ticket style.
        </Text>
        <Text style={styles.cardBody}>{description}</Text>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.duration(260)}
        style={styles.contentCard}
      >
        <Text style={styles.cardEyebrow}>What To Expect</Text>
        <View style={styles.highlightList}>
          {highlights.map((highlight) => (
            <View key={highlight} style={styles.highlightRow}>
              <View style={styles.highlightDot} />
              <Text style={styles.highlightText}>{highlight}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(280)}>
        <VenueMapCard
          eventId={eventId}
          latitude={latitude}
          longitude={longitude}
          venueAddress={venueAddress}
          venueName={venueName}
          venueSummary={venueSummary}
        />
      </Animated.View>

      <Animated.View
        entering={FadeInUp.duration(300)}
        style={[styles.actionPanel, styles.detailActionPanel]}
      >
        <Text style={styles.actionTitle}>
          {isPastEvent ? 'This event date has passed.' : 'Seat selection comes next.'}
        </Text>
        <Text style={styles.actionBody}>
          {isPastEvent
            ? 'You can still view the event details in Discover, but new reservations are disabled for events that have already happened.'
            : 'Pick a section, tap the seats you want, and review the reservation before confirming it.'}
        </Text>
        <Pressable
          accessibilityRole="button"
          disabled={isPastEvent}
          onPress={onChooseSeats}
          style={[styles.primaryButton, isPastEvent && styles.primaryButtonDisabled]}
        >
          <Text style={styles.primaryButtonText}>
            {isPastEvent ? 'Reservations Closed' : 'Choose Seats'}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function SeatSelectionStep({
  focusedSection,
  onContinue,
  onFocusSection,
  onSelectSeat,
  reservationTotal,
  sections,
  seatLimitMessage,
  selectedSeatCount,
  selectedSeatIds,
  visibleSeats,
}: {
  focusedSection: EventSeatSection;
  onContinue: () => void;
  onFocusSection: (value: string) => void;
  onSelectSeat: (seatId: string) => void;
  reservationTotal: number;
  sections: EventSeatSection[];
  seatLimitMessage: string | null;
  selectedSeatCount: number;
  selectedSeatIds: string[];
  visibleSeats: EventSeatOption[];
}) {
  return (
    <View style={styles.seatSelectionLayout}>
      <ScrollView
        contentContainerStyle={styles.seatSelectionContent}
        showsVerticalScrollIndicator={false}
        style={styles.seatSelectionScroll}
      >
        <Animated.View
          entering={FadeInUp.duration(220)}
          style={styles.sectionHeaderBlock}
        >
          <Text style={styles.cardEyebrow}>Seat Selection</Text>
          <Text style={styles.cardTitle}>Pick your seats.</Text>
          <Text style={styles.cardBody}>
            Choose a section, then tap up to three seats to hold your reservation.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(240)}
          style={styles.contentCard}
        >
          <View style={styles.sectionSelectorHeader}>
            <Text style={styles.cardEyebrow}>Choose Section</Text>
            <Text style={styles.sectionSelectorMeta}>
              {`${sections.length} sections available`}
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.sectionSelectorRail}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {sections.map((section) => {
              const isFocused = section.id === focusedSection.id;
              const toneStyle =
                section.availability === "limited"
                  ? styles.sectionRailCardLimited
                  : styles.sectionRailCardOpen;

              return (
                <Pressable
                  accessibilityRole="button"
                  key={section.id}
                  onPress={() => onFocusSection(section.id)}
                  style={[
                    styles.sectionRailCard,
                    toneStyle,
                    isFocused && styles.sectionRailCardActive,
                  ]}
                >
                  <View style={styles.sectionRailTopRow}>
                    <Text style={styles.sectionRailLabel}>{section.label}</Text>
                    <Text
                      style={[
                        styles.sectionRailAvailability,
                        section.availability === "limited"
                          ? styles.sectionRailAvailabilityLimited
                          : styles.sectionRailAvailabilityOpen,
                      ]}
                    >
                      {section.availability === "limited" ? "Low" : "Open"}
                    </Text>
                  </View>

                  <Text style={styles.sectionRailName}>{section.name}</Text>
                  <Text style={styles.sectionRailMeta}>
                    {`${section.availableCount} seats open`}
                  </Text>
                  <Text style={styles.sectionRailPrice}>
                    {`From ${formatCurrency(section.priceFrom)}`}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(260)}
          style={styles.contentCard}
        >
          <View style={styles.seatListHeader}>
            <View style={styles.seatListHeaderCopy}>
              <Text style={styles.cardEyebrow}>Available Seats</Text>
              <Text style={styles.cardTitle}>{focusedSection.name}</Text>
              <Text style={styles.cardBody}>{focusedSection.summary}</Text>
            </View>

            <View style={styles.seatListPriceWrap}>
              <Text style={styles.seatListPriceLabel}>Starts at</Text>
              <Text style={styles.seatListPriceValue}>
                {formatCurrency(focusedSection.priceFrom)}
              </Text>
            </View>
          </View>

          {seatLimitMessage ? (
            <View style={styles.selectionFeedbackBanner}>
              <Ionicons
                color={ticketColors.warning}
                name="alert-circle-outline"
                size={16}
              />
              <Text style={styles.selectionFeedbackText}>
                {seatLimitMessage}
              </Text>
            </View>
          ) : null}

          <View style={styles.seatOptionList}>
            {visibleSeats.map((seat) => {
              const isSelected = selectedSeatIds.includes(seat.id);

              return (
                <Pressable
                  accessibilityRole="button"
                  key={seat.id}
                  onPress={() => onSelectSeat(seat.id)}
                  style={[
                    styles.seatOptionCard,
                    isSelected && styles.seatOptionCardSelected,
                  ]}
                >
                  <View style={styles.seatOptionHead}>
                    <View style={styles.seatOptionCopy}>
                      <Text style={styles.seatOptionTitle}>{seat.label}</Text>
                      <Text
                        style={styles.seatOptionMeta}
                      >{`Row ${seat.row} - Seat ${seat.seat}`}</Text>
                    </View>
                    <View style={styles.seatOptionPriceWrap}>
                      <Text style={styles.seatOptionPrice}>
                        {formatCurrency(seat.price)}
                      </Text>
                      <Text
                        style={[
                          styles.seatOptionAvailability,
                          seat.availability === "limited"
                            ? styles.seatOptionAvailabilityLimited
                            : styles.seatOptionAvailabilityOpen,
                        ]}
                      >
                        {seat.availability === "limited"
                          ? "Low inventory"
                          : "Open"}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.seatOptionNote}>{seat.note}</Text>

                  <View style={styles.seatOptionFooter}>
                    <View style={styles.selectionStatus}>
                      <Ionicons
                        color={isSelected ? "#FFFFFF" : ticketColors.primary}
                        name={
                          isSelected
                            ? "checkmark-circle"
                            : "radio-button-off-outline"
                        }
                        size={18}
                      />
                      <Text
                        style={[
                          styles.selectionStatusText,
                          isSelected && styles.selectionStatusTextSelected,
                        ]}
                      >
                        {isSelected ? "Selected" : "Tap to reserve"}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View
        entering={FadeInUp.duration(280)}
        style={styles.stickyFooter}
      >
        <View style={styles.stickyFooterSummary}>
          <Text style={styles.stickyFooterTitle}>
            {selectedSeatCount
              ? `${selectedSeatCount} seat${selectedSeatCount === 1 ? "" : "s"} selected`
              : "Select seats to continue"}
          </Text>
          <Text style={styles.stickyFooterMeta}>
            {selectedSeatCount
              ? `${formatCurrency(reservationTotal)} total`
              : `Reserve up to ${MAX_RESERVED_SEATS} seats`}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={selectedSeatCount === 0}
          onPress={onContinue}
          style={[
            styles.primaryButton,
            styles.stickyFooterButton,
            selectedSeatCount === 0 && styles.primaryButtonDisabled,
          ]}
        >
          <Text style={styles.primaryButtonText}>Review Reservation</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function ReviewStep({
  eventDate,
  eventTitle,
  eventVenue,
  isSubmitting,
  onConfirm,
  onEditSeats,
  reservationNote,
  reservationTotal,
  selectedSeats,
}: {
  eventDate: string;
  eventTitle: string;
  eventVenue: string;
  isSubmitting: boolean;
  onConfirm: () => void;
  onEditSeats: () => void;
  reservationNote: string;
  reservationTotal: number;
  selectedSeats: EventSeatOption[];
}) {
  return (
    <View style={styles.sectionWrap}>
      <Animated.View
        entering={FadeInUp.duration(220)}
        style={styles.contentCard}
      >
        <Text style={styles.cardEyebrow}>Review</Text>
        <Text style={styles.cardTitle}>Confirm your reservation details.</Text>
        <Text style={styles.cardBody}>
          Payment is intentionally omitted here, so this step focuses on
          clarity: chosen seats, reservation timing, and what the user is
          holding.
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.duration(240)}
        style={styles.summaryCard}
      >
        <Text style={styles.summaryTitle}>{eventTitle}</Text>
        <Text style={styles.summaryMeta}>{`${eventDate} - ${eventVenue}`}</Text>

        <View style={styles.summarySeatList}>
          {selectedSeats.map((seat) => (
            <View key={seat.id} style={styles.summarySeatRow}>
              <Text style={styles.summarySeatLabel}>{seat.label}</Text>
              <Text style={styles.summarySeatPrice}>
                {formatCurrency(seat.price)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summarySeatRow}>
          <Text style={styles.summaryTotalLabel}>Reservation total</Text>
          <Text style={styles.summaryTotalValue}>
            {formatCurrency(reservationTotal)}
          </Text>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.duration(260)}
        style={styles.contentCard}
      >
        <Text style={styles.cardEyebrow}>Reservation Terms</Text>
        <Text style={styles.cardBody}>{reservationNote}</Text>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.duration(280)}
        style={styles.reviewActions}
      >
        <Pressable
          accessibilityRole="button"
          onPress={onEditSeats}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Change Seats</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={onConfirm}
          style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>Confirm Reservation</Text>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

function ConfirmationStep({
  city,
  date,
  onViewMyTickets,
  onReserveMore,
  reservationCode,
  reservationTotal,
  selectedSeats,
  title,
  venue,
}: {
  city: string;
  date: string;
  onViewMyTickets: () => void;
  onReserveMore: () => void;
  reservationCode: string;
  reservationTotal: number;
  selectedSeats: EventSeatOption[];
  title: string;
  venue: string;
}) {
  return (
    <View style={styles.sectionWrap}>
      <Animated.View
        entering={FadeInUp.duration(220)}
        style={styles.confirmationHero}
      >
        <View style={styles.confirmationIcon}>
          <Ionicons color="#FFFFFF" name="checkmark" size={26} />
        </View>
        <Text style={styles.confirmationTitle}>Reservation Confirmed</Text>
        <Text style={styles.confirmationBody}>
          The selected seats are now held under your reservation details below.
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.duration(240)}
        style={styles.summaryCard}
      >
        <Text style={styles.cardEyebrow}>Reservation Details</Text>
        <Text style={styles.summaryTitle}>{title}</Text>
        <Text style={styles.summaryMeta}>{`${date} - ${venue} - ${city}`}</Text>
        <Text style={styles.confirmationCode}>{reservationCode}</Text>

        <View style={styles.summarySeatList}>
          {selectedSeats.map((seat) => (
            <View key={seat.id} style={styles.summarySeatRow}>
              <Text style={styles.summarySeatLabel}>{seat.label}</Text>
              <Text style={styles.summarySeatPrice}>
                {formatCurrency(seat.price)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summarySeatRow}>
          <Text style={styles.summaryTotalLabel}>Reserved value</Text>
          <Text style={styles.summaryTotalValue}>
            {formatCurrency(reservationTotal)}
          </Text>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.duration(260)}
        style={styles.reviewActions}
      >
        <Pressable
          accessibilityRole="button"
          onPress={onReserveMore}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Reserve More</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onViewMyTickets}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>View My Tickets</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ticketColors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: ticketSpacing.xxl,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: ticketSpacing.md,
    paddingTop: ticketSpacing.md,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  stepBadge: {
    backgroundColor: ticketColors.primarySoft,
    borderRadius: ticketRadii.pill,
    paddingHorizontal: ticketSpacing.md,
    paddingVertical: ticketSpacing.xs,
  },
  stepBadgeText: {
    color: ticketColors.primaryBright,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 16,
  },
  stepContainer: {
    gap: ticketSpacing.lg,
    paddingHorizontal: ticketSpacing.md,
    paddingTop: ticketSpacing.lg,
  },
  stepContainerFill: {
    flexGrow: 1,
  },
  seatStepContainer: {
    flex: 1,
    minHeight: 0,
    paddingBottom: ticketSpacing.sm,
  },
  heroCard: {
    borderRadius: ticketRadii.md,
    height: 260,
    overflow: "hidden",
    position: "relative",
  },
  heroImage: {
    height: "100%",
    width: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 17, 34, 0.44)",
  },
  heroContent: {
    bottom: ticketSpacing.md,
    left: ticketSpacing.md,
    position: "absolute",
    right: ticketSpacing.md,
  },
  heroDate: {
    color: "rgba(255, 255, 255, 0.84)",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 33,
    marginTop: ticketSpacing.xs,
  },
  heroVenue: {
    color: "rgba(255, 255, 255, 0.86)",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: ticketSpacing.xs,
  },
  sectionWrap: {
    gap: ticketSpacing.md,
  },
  detailSectionWrap: {
    flexGrow: 1,
  },
  metricRow: {
    flexDirection: "row",
    gap: ticketSpacing.sm,
  },
  metricCard: {
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    flex: 1,
    gap: ticketSpacing.xxs,
    padding: ticketSpacing.sm,
  },
  metricLabel: {
    color: ticketColors.textSubtle,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  metricValue: {
    color: ticketColors.text,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 20,
  },
  contentCard: {
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    gap: ticketSpacing.xs,
    padding: ticketSpacing.md,
  },
  cardEyebrow: {
    color: ticketColors.primaryBright,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16,
    textTransform: "uppercase",
  },
  cardTitle: {
    color: ticketColors.text,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 25,
  },
  cardBody: {
    color: ticketColors.textMuted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
  sectionHeaderBlock: {
    gap: ticketSpacing.xxs,
    paddingHorizontal: ticketSpacing.xs,
  },
  highlightList: {
    gap: ticketSpacing.xs,
  },
  highlightRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: ticketSpacing.xs,
  },
  highlightDot: {
    backgroundColor: ticketColors.primary,
    borderRadius: ticketRadii.pill,
    height: 8,
    marginTop: 7,
    width: 8,
  },
  highlightText: {
    color: ticketColors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  actionPanel: {
    backgroundColor: ticketColors.chromeElevated,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    gap: ticketSpacing.xs,
    padding: ticketSpacing.md,
  },
  detailActionPanel: {
    marginTop: "auto",
  },
  actionTitle: {
    color: ticketColors.text,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23,
  },
  actionBody: {
    color: ticketColors.textMuted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: ticketColors.primary,
    borderRadius: ticketRadii.md,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: ticketSpacing.lg,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 18,
  },
  seatSelectionLayout: {
    flex: 1,
    minHeight: 0,
  },
  seatSelectionScroll: {
    flex: 1,
  },
  seatSelectionContent: {
    gap: ticketSpacing.md,
    paddingBottom: ticketSpacing.xl,
  },
  sectionSelectorHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionSelectorMeta: {
    color: ticketColors.textSubtle,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  sectionSelectorRail: {
    gap: ticketSpacing.sm,
    paddingTop: ticketSpacing.xs,
  },
  sectionRailCard: {
    borderRadius: ticketRadii.md,
    gap: ticketSpacing.xxs,
    minWidth: 156,
    padding: ticketSpacing.sm,
  },
  sectionRailCardOpen: {
    backgroundColor: "rgba(20, 136, 90, 0.10)",
    borderColor: "rgba(20, 136, 90, 0.18)",
    borderWidth: 1,
  },
  sectionRailCardLimited: {
    backgroundColor: "rgba(154, 103, 0, 0.10)",
    borderColor: "rgba(154, 103, 0, 0.20)",
    borderWidth: 1,
  },
  sectionRailCardActive: {
    borderColor: ticketColors.primary,
    borderWidth: 2,
    shadowColor: ticketColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  sectionRailTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionRailLabel: {
    color: ticketColors.textSubtle,
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 15,
    textTransform: "uppercase",
  },
  sectionRailAvailability: {
    borderRadius: ticketRadii.pill,
    fontSize: 10,
    fontWeight: "800",
    lineHeight: 14,
    overflow: "hidden",
    paddingHorizontal: ticketSpacing.xs,
    paddingVertical: 2,
  },
  sectionRailAvailabilityOpen: {
    backgroundColor: "rgba(20, 136, 90, 0.16)",
    color: ticketColors.success,
  },
  sectionRailAvailabilityLimited: {
    backgroundColor: "rgba(154, 103, 0, 0.16)",
    color: ticketColors.warning,
  },
  sectionRailName: {
    color: ticketColors.text,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 21,
  },
  sectionRailMeta: {
    color: ticketColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  sectionRailPrice: {
    color: ticketColors.text,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 17,
    marginTop: ticketSpacing.xs,
  },
  seatListHeader: {
    flexDirection: "row",
    gap: ticketSpacing.md,
    justifyContent: "space-between",
  },
  seatListHeaderCopy: {
    flex: 1,
    gap: ticketSpacing.xxs,
  },
  seatListPriceWrap: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  seatListPriceLabel: {
    color: ticketColors.textSubtle,
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 15,
    textTransform: "uppercase",
  },
  seatListPriceValue: {
    color: ticketColors.text,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 22,
    marginTop: ticketSpacing.xxs,
  },
  selectionFeedbackBanner: {
    alignItems: "flex-start",
    backgroundColor: "rgba(154, 103, 0, 0.10)",
    borderRadius: ticketRadii.md,
    flexDirection: "row",
    gap: ticketSpacing.xs,
    paddingHorizontal: ticketSpacing.sm,
    paddingVertical: ticketSpacing.xs,
  },
  selectionFeedbackText: {
    color: ticketColors.text,
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
  },
  seatOptionList: {
    gap: ticketSpacing.sm,
    marginTop: ticketSpacing.sm,
  },
  seatOptionCard: {
    backgroundColor: ticketColors.chromeElevated,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    gap: ticketSpacing.xs,
    padding: ticketSpacing.sm,
  },
  seatOptionCardSelected: {
    backgroundColor: ticketColors.primary,
    borderColor: ticketColors.primaryBright,
  },
  seatOptionHead: {
    flexDirection: "row",
    gap: ticketSpacing.sm,
    justifyContent: "space-between",
  },
  seatOptionCopy: {
    flex: 1,
    gap: ticketSpacing.xxs,
  },
  seatOptionTitle: {
    color: ticketColors.text,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 19,
  },
  seatOptionMeta: {
    color: ticketColors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 17,
  },
  seatOptionPriceWrap: {
    alignItems: "flex-end",
    gap: ticketSpacing.xxs,
  },
  seatOptionPrice: {
    color: ticketColors.text,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 19,
  },
  seatOptionAvailability: {
    borderRadius: ticketRadii.pill,
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 15,
    overflow: "hidden",
    paddingHorizontal: ticketSpacing.sm,
    paddingVertical: 2,
  },
  seatOptionAvailabilityOpen: {
    backgroundColor: "rgba(20, 136, 90, 0.14)",
    color: ticketColors.success,
  },
  seatOptionAvailabilityLimited: {
    backgroundColor: "rgba(154, 103, 0, 0.14)",
    color: ticketColors.warning,
  },
  seatOptionNote: {
    color: ticketColors.textSubtle,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  seatOptionFooter: {
    alignItems: "flex-start",
  },
  selectionStatus: {
    alignItems: "center",
    flexDirection: "row",
    gap: ticketSpacing.xs,
  },
  selectionStatusText: {
    color: ticketColors.primaryBright,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16,
  },
  selectionStatusTextSelected: {
    color: "#FFFFFF",
  },
  stickyFooter: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderColor: ticketColors.borderStrong,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: ticketSpacing.md,
    marginTop: ticketSpacing.sm,
    padding: ticketSpacing.md,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  stickyFooterSummary: {
    flex: 1,
    gap: 2,
  },
  stickyFooterTitle: {
    color: ticketColors.text,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 20,
  },
  stickyFooterMeta: {
    color: ticketColors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 17,
  },
  stickyFooterButton: {
    minHeight: 54,
    minWidth: 164,
  },
  summaryCard: {
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.borderStrong,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    gap: ticketSpacing.xs,
    padding: ticketSpacing.md,
  },
  summaryTitle: {
    color: ticketColors.text,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 24,
  },
  summaryMeta: {
    color: ticketColors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  summarySeatList: {
    gap: ticketSpacing.sm,
    marginTop: ticketSpacing.sm,
  },
  summarySeatRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summarySeatLabel: {
    color: ticketColors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
  },
  summarySeatPrice: {
    color: ticketColors.text,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 18,
  },
  summaryDivider: {
    backgroundColor: ticketColors.border,
    height: 1,
    marginVertical: ticketSpacing.xs,
  },
  summaryTotalLabel: {
    color: ticketColors.textSubtle,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 17,
  },
  summaryTotalValue: {
    color: ticketColors.text,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 22,
  },
  reviewActions: {
    gap: ticketSpacing.sm,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.borderStrong,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: ticketSpacing.lg,
  },
  secondaryButtonText: {
    color: ticketColors.text,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 18,
  },
  confirmationHero: {
    alignItems: "center",
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    gap: ticketSpacing.xs,
    paddingHorizontal: ticketSpacing.md,
    paddingVertical: ticketSpacing.lg,
  },
  confirmationIcon: {
    alignItems: "center",
    backgroundColor: ticketColors.success,
    borderRadius: ticketRadii.pill,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  confirmationTitle: {
    color: ticketColors.text,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 27,
    textAlign: "center",
  },
  confirmationBody: {
    color: ticketColors.textMuted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    textAlign: "center",
  },
  confirmationCode: {
    color: ticketColors.primaryBright,
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 17,
    marginTop: ticketSpacing.xs,
  },
  notFoundWrap: {
    flex: 1,
    gap: ticketSpacing.lg,
    paddingHorizontal: ticketSpacing.lg,
    paddingTop: ticketSpacing.lg,
  },
  notFoundCard: {
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    gap: ticketSpacing.sm,
    padding: ticketSpacing.md,
  },
  notFoundEyebrow: {
    color: ticketColors.primaryBright,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16,
    textTransform: "uppercase",
  },
  notFoundTitle: {
    color: ticketColors.text,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 28,
  },
  notFoundBody: {
    color: ticketColors.textMuted,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
});
