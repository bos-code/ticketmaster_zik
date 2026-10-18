import { Text, TextInput } from '@/components/ui/app-text';
import React from "react";
import { Keyboard, Platform, Pressable, StyleSheet, View, type TextInput as NativeTextInput, type TextStyle } from "react-native";

import { useImmersiveSafeAreaInsets } from "@/components/immersive/edge-to-edge-hero";
import { useEditable } from "@/components/tickets/EditableContext";
import { EditableText } from "@/components/tickets/EditableText";
import { BottomDrawer } from "@/components/ui/bottom-drawer";
import { useKeyboardLayout } from "@/hooks/use-keyboard-height";
import { normalizeOtp, OTP_LENGTH } from "@/lib/auth/otp";

// Measured from the reference recording (390 pt wide phone).
const SHEET_TOP_GAP = 4;
// The sheet is 90% of the full height below the status bar.
const SHEET_HEIGHT_RATIO = 0.9;
const HEADER_HEIGHT = 52;
const CARD_HEIGHT = 331;
// Spacing removed by the compact card (see the *Compact styles).
const COMPACT_SPACE_SAVED = 51;

export function TicketTransferAuthModal({
  authPhoneNumber,
  confirmCodeReady,
  isSubmitting = false,
  onCancel,
  onConfirm,
  onOtpChange,
  otpCode,
  visible,
}: {
  authPhoneNumber?: string;
  confirmCodeReady: boolean;
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onOtpChange: (value: string) => void;
  otpCode: string;
  visible: boolean;
}) {
  const inputRef = React.useRef<NativeTextInput | null>(null);
  const insets = useImmersiveSafeAreaInsets();
  const { keyboard, visibleHeight, windowHeight } = useKeyboardLayout();
  // Admin Live Preview: the phone number becomes editable in place.
  const editable = useEditable();
  const [isFocused, setIsFocused] = React.useState(false);
  // Full-spacing card height; the message can wrap to more lines on narrow phones.
  const [cardHeight, setCardHeight] = React.useState(CARD_HEIGHT);
  const isKeyboardOpen = keyboard.height > 0;
  const canConfirm = confirmCodeReady && !isSubmitting;
  const sheetHeight = Math.round((windowHeight - insets.top - SHEET_TOP_GAP) * SHEET_HEIGHT_RATIO);
  // With the keyboard open the sheet grows upward only as far as the card needs.
  const minOpenHeight = HEADER_HEIGHT + cardHeight;
  // Space between the header and the keyboard (or the bottom safe area).
  const bodySpace =
    (isKeyboardOpen
      ? Math.min(Math.max(sheetHeight - keyboard.height, minOpenHeight), visibleHeight - insets.top)
      : sheetHeight - insets.bottom) - HEADER_HEIGHT;
  // Tighten the card's spacing on short screens so the input and button stay above the keyboard.
  const isCompact = bodySpace < cardHeight;

  React.useEffect(() => {
    if (!visible) {
      return;
    }

    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 220);

    return () => clearTimeout(focusTimer);
  }, [visible]);

  function handleConfirm() {
    if (!canConfirm) {
      return;
    }

    Keyboard.dismiss();
    onConfirm();
  }

  return (
    <BottomDrawer
      header={
        <View style={styles.header}>
          <View pointerEvents="none" style={styles.headerTitleWrap}>
            <Text accessibilityRole="header" style={styles.headerTitle}>
              Authentication
            </Text>
          </View>
          <Pressable accessibilityRole="button" hitSlop={12} onPress={onCancel}>
            <Text style={styles.headerAction}>Cancel</Text>
          </Pressable>
        </View>
      }
      keepTopOnKeyboard
      minHeight={sheetHeight}
      minLiftedHeight={minOpenHeight}
      onClose={onCancel}
      panelStyle={styles.sheet}
      scrollToEndOnKeyboard
      visible={visible}
    >
      <View style={[styles.body, isKeyboardOpen ? styles.bodyBelowHeader : styles.bodyCentered]}>
        <View
          onLayout={(event) => setCardHeight(Math.round(event.nativeEvent.layout.height) + (isCompact ? COMPACT_SPACE_SAVED : 0))}
          style={[styles.card, isCompact && styles.cardCompact]}
        >
          <Text style={styles.title}>{"Authenticate Your\nAccount"}</Text>
          <Text style={[styles.message, isCompact && styles.messageCompact]}>
            A one-time code has been sent to{" "}
            <Text style={styles.maskedNumber}>{formatAuthPhoneNumber(authPhoneNumber)}</Text>
            . Please enter your code below to continue.
          </Text>
          {editable ? (
            <View style={styles.adminNumber}>
              <Text style={styles.adminNumberLabel}>Phone number shown above (type the number or its last 4 digits)</Text>
              <EditableText field="authPhoneNumber" style={styles.adminNumberInput} value={editable.ticket.authPhoneNumber ?? ""} />
            </View>
          ) : null}

          <Text style={[styles.label, isCompact && styles.labelCompact]}>One-Time Code</Text>
          <TextInput
            ref={inputRef}
            accessibilityLabel="One-Time Code"
            autoComplete={Platform.OS === "android" ? "sms-otp" : "one-time-code"}
            autoFocus={visible}
            inputMode="numeric"
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            onBlur={() => setIsFocused(false)}
            onChangeText={(value) => onOtpChange(normalizeOtp(value))}
            onFocus={() => setIsFocused(true)}
            onSubmitEditing={handleConfirm}
            returnKeyType="done"
            selectionColor="#13318A"
            style={[styles.input, isFocused ? styles.inputFocused : styles.inputIdle, WEB_NO_FOCUS_RING]}
            textContentType="oneTimeCode"
            value={otpCode}
          />
          <Text style={styles.helper}>It may take a minute to receive your code.</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canConfirm }}
            disabled={!canConfirm}
            onPress={handleConfirm}
            style={[styles.button, isCompact && styles.buttonCompact, canConfirm ? styles.buttonEnabled : styles.buttonDisabled]}
          >
            <Text style={[styles.buttonLabel, canConfirm ? styles.buttonLabelEnabled : styles.buttonLabelDisabled]}>
              Confirm Code
            </Text>
          </Pressable>
        </View>
      </View>
    </BottomDrawer>
  );
}

// The focused border is the focus indicator here, as in the reference; drop the
// app-wide :focus-visible ring (inline so it wins over global.css).
const WEB_NO_FOCUS_RING = Platform.OS === "web" ? ({ outlineStyle: "none" } as unknown as TextStyle) : null;

const DEFAULT_AUTH_PHONE_NUMBER = "*******1886";

function formatAuthPhoneNumber(phoneNumber?: string) {
  const lastFourDigits = phoneNumber?.match(/\d{4}$/)?.[0];

  if (lastFourDigits) {
    return `*******${lastFourDigits}`;
  }

  return phoneNumber?.trim() || DEFAULT_AUTH_PHONE_NUMBER;
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: "#2C2C2C",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    // The sheet's height is computed above; the drawer's default 95% cap would
    // move its top edge when the keyboard opens.
    maxHeight: "100%",
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    backgroundColor: "#0E62D5",
    flexDirection: "row",
    height: HEADER_HEIGHT,
    paddingHorizontal: 18,
  },
  headerTitleWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
  },
  headerAction: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 20,
  },
  body: {
    flex: 1,
    paddingHorizontal: 12.5,
  },
  bodyCentered: {
    justifyContent: "center",
  },
  bodyBelowHeader: {
    justifyContent: "flex-start",
  },
  card: {
    alignSelf: "stretch",
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    paddingBottom: 22,
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  cardCompact: {
    paddingBottom: 12,
    paddingTop: 10,
  },
  title: {
    color: "#000000",
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
  },
  message: {
    color: "#0A0A0A",
    fontSize: 15,
    fontWeight: "400",
    lineHeight: 20,
    marginTop: 15,
  },
  messageCompact: {
    marginTop: 6,
  },
  adminNumber: {
    borderColor: "#0E62D5",
    borderRadius: 4,
    borderStyle: "dashed",
    borderWidth: 1,
    gap: 4,
    marginTop: 10,
    padding: 8,
  },
  adminNumberLabel: {
    color: "#0E62D5",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 14,
  },
  adminNumberInput: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
    minHeight: 22,
  },
  maskedNumber: {
    color: "#000000",
    fontWeight: "700",
  },
  label: {
    color: "#0A0A0A",
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 17,
    marginTop: 14,
  },
  labelCompact: {
    marginTop: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
    color: "#000000",
    // iOS Safari zooms the page when a focused input is smaller than 16px.
    fontSize: Platform.OS === "web" ? 16 : 14,
    fontWeight: "400",
    height: 40,
    letterSpacing: 0,
    marginTop: 8,
    paddingVertical: 0,
  },
  inputIdle: {
    borderColor: "#C6C6C6",
    borderWidth: 1,
    paddingHorizontal: 15,
  },
  inputFocused: {
    borderColor: "#13318A",
    borderWidth: 1.5,
    paddingHorizontal: 14.5,
  },
  helper: {
    color: "#0A0A0A",
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
    marginTop: 15,
  },
  button: {
    alignItems: "center",
    borderRadius: 2,
    height: 40,
    justifyContent: "center",
    marginTop: 30,
  },
  buttonCompact: {
    marginTop: 12,
  },
  buttonEnabled: {
    backgroundColor: "#0B40D4",
  },
  buttonDisabled: {
    backgroundColor: "#E6E6E6",
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 20,
  },
  buttonLabelEnabled: {
    color: "#FFFFFF",
  },
  buttonLabelDisabled: {
    color: "#757575",
  },
});
