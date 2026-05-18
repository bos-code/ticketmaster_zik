import React from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { Image } from "expo-image";

import { cx } from "@/components/tickets/cx";
import { BottomDrawer } from "@/components/ui/bottom-drawer";
import { normalizeOtp, OTP_LENGTH } from "@/lib/auth/otp";

export function TicketTransferAuthModal({
  confirmCodeReady,
  isLoading = false,
  onCancel,
  onConfirm,
  onOtpChange,
  otpCode,
  visible,
}: {
  confirmCodeReady: boolean;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onOtpChange: (value: string) => void;
  otpCode: string;
  visible: boolean;
}) {
  const inputRef = React.useRef<TextInput | null>(null);

  React.useEffect(() => {
    if (!visible || isLoading) {
      return;
    }

    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 220);

    return () => clearTimeout(focusTimer);
  }, [isLoading, visible]);

  React.useEffect(() => {
    if (otpCode.length === OTP_LENGTH) {
      Keyboard.dismiss();
    }
  }, [otpCode]);

  return (
    <BottomDrawer minHeight="93%" onClose={onCancel} visible={visible} className="bg-[#007AFF] rounded-t-2xl" >
      {/* Header Inside Drawer */}
      <View className="bg-[#007AFF] h-[54px] w-full flex-row rounded-t-2xl items-center px-[18px]">
        <Pressable accessibilityRole="button" hitSlop={12} onPress={onCancel}>
          <Text className="text-[14px] font-normal text-white">
            Cancel
          </Text>
        </Pressable>
        <Text className="flex-1 text-center text-[15px] font-bold text-white">
          Authentication
        </Text>
        <View style={{ minWidth: 44 }} />
      </View>

      {isLoading ? (
        <View className="flex-1 w-full items-center justify-center bg-white">
          <ActivityIndicator color="#5C94DA" size="large" />
        </View>
      ) : (
        <View className="flex-1 w-full bg-white">
          {/* Hero Illustration Section */}
          <View className="bg-[#111111] py-12 items-center justify-center">
            <Image
              source={require("../../../assets/tickets/otp_auth_hero.jpg")}
              style={{ width: 180, height: 120 }}
              contentFit="contain"
            />
          </View>

          <View className="px-5 pt-6">
            <Text className="text-xl font-bold leading-[22px] tracking-wider text-[#111111]">
              Authenticate Your Account
            </Text>
            <Text className="mt-[8px] text-[13.5px] font-normal leading-[18px] text-[#4E5561]">
              A one-time code has been sent to ******2970. Please enter your code below to continue.
            </Text>
          </View>

          <View className="gap-2 px-[18px] pt-6">
            <Text className="text-[11px] font-bold leading-[13px] text-[#4A4F58]">
              One-Time Code
            </Text>
            <TextInput
              ref={inputRef}
              autoComplete={Platform.OS === "android" ? "sms-otp" : "one-time-code"}
              autoFocus={visible}
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
                {
                  minHeight: 46,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: otpCode.length ? "#2F88F3" : "#D1D5DB",
                  paddingHorizontal: 16,
                  backgroundColor: "#FFFFFF",
                  color: "#111111",
                  fontSize: 20,
                  fontWeight: "500",
                  letterSpacing: 4,
                },
              ]}
              textContentType="oneTimeCode"
              value={otpCode}
            />
            <Text className="text-[11px] font-normal leading-[13px] text-[#80858E]">
              It may take a minute to receive your code.
            </Text>
          </View>

          <View className="mt-auto">
            <View className="px-2 pb-6 pt-2 h-[68px]">
              <Pressable
                accessibilityRole="button"
                disabled={!confirmCodeReady}
                onPress={onConfirm}
                className={cx(
                  "h-[44px] items-center justify-center rounded-[4px]",
                  confirmCodeReady ? "bg-[#0863D9]" : "bg-[#B8D8F6]"
                )}
              >
                <Text className="text-[14px] font-black text-white uppercase">
                  Confirm Code
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </BottomDrawer>
  );
}
