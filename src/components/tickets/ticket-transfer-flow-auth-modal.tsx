import React from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Svg, { Circle } from "react-native-svg";

import { BottomDrawer } from "@/components/ui/bottom-drawer";
import { normalizeOtp, OTP_LENGTH } from "@/lib/auth/otp";
import { fonts } from "../../../theme/fonts";

const DEFAULT_AUTH_PHONE_NUMBER = "*******1886";

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
  const inputRef = React.useRef<TextInput | null>(null);
  const phoneNumber = formatAuthPhoneNumber(authPhoneNumber);

  return (
    <BottomDrawer
      className="overflow-hidden rounded-t-[8px] bg-[#292929]"
      minHeight="91%"
      onClose={onCancel}
      visible={visible}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          onPress={onCancel}
          style={styles.headerAction}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>
          Authentication
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.authBody}>
        <View style={styles.authCard}>
          <Text style={styles.cardTitle}>
            Authenticate Your Account
          </Text>
          <Text style={styles.cardCopy}>
            A one-time code has been sent to {phoneNumber}. Please enter your code below to continue.
          </Text>

          <Text style={styles.codeLabel}>
            One-Time Code
          </Text>
          <TextInput
            ref={inputRef}
            autoComplete={Platform.OS === "android" ? "sms-otp" : "one-time-code"}
            autoFocus={visible}
            editable={!isSubmitting}
            inputMode="numeric"
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            onChangeText={(value) => onOtpChange(normalizeOtp(value))}
            onSubmitEditing={() => {
              if (confirmCodeReady) {
                onConfirm();
              }
            }}
            placeholder=""
            placeholderTextColor="#80858E"
            returnKeyType="done"
            selectionColor="#2F88F3"
            style={[
              styles.codeInput,
              otpCode.length ? styles.codeInputActive : null,
              Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : null,
            ]}
            textContentType="oneTimeCode"
            value={otpCode}
          />
          <Text style={styles.codeHelp}>
            It may take a minute to receive your code.
          </Text>

          <Pressable
            accessibilityRole="button"
            disabled={!confirmCodeReady || isSubmitting}
            onPress={onConfirm}
            style={[
              styles.confirmButton,
              confirmCodeReady || isSubmitting
                ? styles.confirmButtonReady
                : null,
            ]}
          >
            {isSubmitting ? (
              <ButtonLoadingSpinner size={32} />
            ) : (
              <Text
                style={[
                  styles.confirmButtonText,
                  confirmCodeReady ? styles.confirmButtonTextReady : null,
                ]}
              >
                Confirm Code
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </BottomDrawer>
  );
}

function formatAuthPhoneNumber(phoneNumber?: string) {
  const lastFourDigits = phoneNumber?.match(/\d{4}$/)?.[0];

  if (lastFourDigits) {
    return `*******${lastFourDigits}`;
  }

  return phoneNumber?.trim() || DEFAULT_AUTH_PHONE_NUMBER;
}

function ButtonLoadingSpinner({ size }: { size: number }) {
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        duration: 760,
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: true,
      }),
    );

    animation.start();
    return () => animation.stop();
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={{
        height: size,
        transform: [{ rotate: spin }],
        width: size,
      }}
    >
      <Svg height={size} viewBox="0 0 32 32" width={size}>
        <Circle
          cx={16}
          cy={16}
          fill="none"
          r={12}
          stroke="rgba(255,255,255,0.32)"
          strokeWidth={3}
        />
        <Circle
          cx={16}
          cy={16}
          fill="none"
          r={12}
          stroke="#C7DBFF"
          strokeDasharray="45 76"
          strokeLinecap="round"
          strokeWidth={3}
          transform="rotate(-90 16 16)"
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  authBody: {
    alignItems: "center",
    backgroundColor: "#292929",
    flex: 1,
    justifyContent: "center",
    paddingBottom: 28,
    paddingHorizontal: 14,
    paddingTop: 70,
    width: "100%",
  },
  authCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
    paddingBottom: 34,
    paddingHorizontal: 32,
    paddingTop: 36,
    width: "100%",
  },
  cancelText: {
    color: "rgba(255, 255, 255, 0.82)",
    fontFamily: fonts.medium,
    fontSize: 18,
    lineHeight: 24,
  },
  cardCopy: {
    color: "#2D2D2D",
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 24,
  },
  cardTitle: {
    color: "#111111",
    fontFamily: fonts.extraBold,
    fontSize: 27,
    letterSpacing: -0.2,
    lineHeight: 34,
    maxWidth: 300,
  },
  codeHelp: {
    color: "#333333",
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 23,
  },
  codeInput: {
    backgroundColor: "#FFFFFF",
    borderColor: "#BDBDBD",
    borderRadius: 0,
    borderWidth: 1.5,
    color: "#111111",
    fontFamily: fonts.medium,
    fontSize: 20,
    height: 58,
    letterSpacing: 4,
    marginTop: 11,
    paddingHorizontal: 14,
  },
  codeInputActive: {
    borderColor: "#7B7B7B",
  },
  codeLabel: {
    color: "#222222",
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
    marginTop: 25,
  },
  confirmButton: {
    alignItems: "center",
    backgroundColor: "#E6E7E7",
    borderRadius: 4,
    height: 59,
    justifyContent: "center",
    marginTop: 44,
  },
  confirmButtonReady: {
    backgroundColor: "#0863D9",
  },
  confirmButtonText: {
    color: "#969B9F",
    fontFamily: fonts.semiBold,
    fontSize: 17,
    lineHeight: 22,
  },
  confirmButtonTextReady: {
    color: "#FFFFFF",
  },
  header: {
    alignItems: "center",
    backgroundColor: "#086ADD",
    flexDirection: "row",
    height: 76,
    paddingHorizontal: 25,
    width: "100%",
  },
  headerAction: {
    width: 76,
  },
  headerSpacer: {
    width: 76,
  },
  headerTitle: {
    color: "#FFFFFF",
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 24,
    textAlign: "center",
  },
});
