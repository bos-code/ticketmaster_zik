import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { cx } from "@/components/tickets/cx";
import { OtpIllustration } from "@/components/tickets/OtpIllustration";
import { KEYPAD_KEYS } from "@/components/tickets/ticketFlowConstants";

export function TicketTransferAuthModal({
  confirmCodeReady,
  frameWidth,
  onCancel,
  onConfirm,
  onOtpBackspace,
  onOtpDigit,
  otpCode,
  visible,
}: {
  confirmCodeReady: boolean;
  frameWidth: number;
  onCancel: () => void;
  onConfirm: () => void;
  onOtpBackspace: () => void;
  onOtpDigit: (digit: string) => void;
  otpCode: string;
  visible: boolean;
}) {
  return (
    <Modal animationType="slide" visible={visible}>
      <View className="flex-1 items-center bg-white">
        <SafeAreaView
          edges={["top"]}
          style={{ width: "100%", backgroundColor: "#0863D9" }}
        >
          <View
            className="min-h-[46px] w-full flex-row items-center bg-[#0863D9] px-[14px]"
            style={{ maxWidth: frameWidth }}
          >
            <Pressable accessibilityRole="button" hitSlop={8} onPress={onCancel}>
              <Text className="text-[14px] font-normal leading-[17px] text-white">
                Cancel
              </Text>
            </Pressable>
            <Text className="flex-1 text-center text-[15px] font-bold leading-[18px] text-white">
              Authentication
            </Text>
            <View style={{ minWidth: 42 }} />
          </View>
        </SafeAreaView>

        <View
          className="flex-1 w-full bg-white pb-[18px]"
          style={{ maxWidth: frameWidth }}
        >
          <OtpIllustration />

          <View className="px-[18px] pt-[22px]">
            <Text className="text-[17px] font-bold leading-[21px] text-[#1A1A1A]">
              Authenticate Your Account
            </Text>
            <Text className="mt-[10px] text-[13px] font-normal leading-[18px] text-[#4E5561]">
              A one-time code has been sent to ******2970. Please enter your
              code below to continue.
            </Text>
          </View>

          <View className="gap-2 px-[18px] pt-[18px]">
            <Text className="text-[12px] font-medium leading-[14px] text-[#4A4F58]">
              One-Time Code
            </Text>
            <View className="min-h-9 justify-center rounded-[4px] border border-[#2F88F3] px-3">
              <Text className="text-[18px] font-medium leading-[22px] tracking-[2px] text-[#1A1A1A]">
                {otpCode}
              </Text>
            </View>
            <Text className="text-[11px] font-normal leading-[13px] text-[#80858E]">
              It may take a minute to receive your code.
            </Text>
          </View>

          <View className="mt-auto flex-row flex-wrap px-[1px] pt-5">
            {KEYPAD_KEYS.map((key) => {
              if (key === "") {
                return <View key="blank-key" className="h-12 w-1/3" />;
              }

              if (key === "back") {
                return (
                  <Pressable
                    accessibilityRole="button"
                    key={key}
                    onPress={onOtpBackspace}
                    className="h-12 w-1/3 items-center justify-center border border-[#D8DBE2] bg-white"
                  >
                    <Ionicons
                      color="#3B3B3B"
                      name="backspace-outline"
                      size={20}
                    />
                  </Pressable>
                );
              }

              return (
                <Pressable
                  accessibilityRole="button"
                  key={key}
                  onPress={() => onOtpDigit(key)}
                  className="h-12 w-1/3 items-center justify-center border border-[#D8DBE2] bg-white"
                >
                  <Text className="text-[28px] font-normal leading-[30px] text-[#1A1A1A]">
                    {key}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={!confirmCodeReady}
            onPress={onConfirm}
            className={cx(
              "mx-[18px] mt-4 min-h-10 items-center justify-center",
              confirmCodeReady ? "bg-[#0863D9]" : "bg-[#B8D8F6]",
            )}
          >
            <Text
              className={cx(
                "text-[13px] font-semibold leading-4",
                confirmCodeReady ? "text-white" : "text-[#F7FBFF]",
              )}
            >
              Confirm Code
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
