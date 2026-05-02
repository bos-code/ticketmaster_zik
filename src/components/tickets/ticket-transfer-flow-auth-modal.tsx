import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { Image } from "expo-image";
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from "react-native-reanimated";

import { cx } from "@/components/tickets/cx";
import { BottomDrawer } from "@/components/ui/bottom-drawer";

const AUTH_KEYPAD = [
  { val: "1", sub: "" },
  { val: "2", sub: "A B C" },
  { val: "3", sub: "D E F" },
  { val: "4", sub: "G H I" },
  { val: "5", sub: "J K L" },
  { val: "6", sub: "M N O" },
  { val: "7", sub: "P Q R S" },
  { val: "8", sub: "T U V" },
  { val: "9", sub: "W X Y Z" },
  { val: "", sub: "" },
  { val: "0", sub: "" },
  { val: "back", sub: "" },
];

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
  const [isKeypadVisible, setIsKeypadVisible] = React.useState(false);
  const keypadTranslateY = useSharedValue(400); // Start hidden below

  React.useEffect(() => {
    keypadTranslateY.value = withTiming(isKeypadVisible ? 0 : 400, {
      duration: 300,
    });
  }, [isKeypadVisible]);

  // Auto-hide when 6 digits reached
  React.useEffect(() => {
    if (otpCode.length === 6) {
      setIsKeypadVisible(false);
    }
  }, [otpCode]);

  const animatedKeypadStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: keypadTranslateY.value }],
  }));

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

      <View className="flex-1 w-full bg-white">
        {/* Hero Illustration Section */}
        <View className="bg-[#111111] py-12 items-center justify-center">
          <Image
            source={require("@/assets/tickets/otp_auth_hero.jpg")}
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
          <Pressable
            onPress={() => setIsKeypadVisible(true)}
            className={cx(
              "min-h-[46px] justify-center rounded-[8px] border px-4 bg-white",
              isKeypadVisible ? "border-[#2F88F3]" : "border-[#D1D5DB]"
            )}
          >
            <Text className="text-[20px] font-medium leading-[24px] tracking-[4px] text-[#111111]">
              {otpCode}
            </Text>
          </Pressable>
          <Text className="text-[11px] font-normal leading-[13px] text-[#80858E]">
            It may take a minute to receive your code.
          </Text>
        </View>

        {/* Bottom Section (Keypad or Button) */}
        <View className="mt-auto">
          {/* Always reserve space for the button at the very bottom */}
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

          {/* Keypad Overlays the bottom area when visible */}
          <Animated.View 
            style={[
              { position: 'absolute', bottom: 0, left: 0, right: 0 },
              animatedKeypadStyle
            ]}
            className="bg-[#F4F5F7] p-2 pt-5"
          >
            <View className="flex-row flex-wrap justify-between">
              {AUTH_KEYPAD.map((item, index) => {
                if (item.val === "") {
                  return (
                    <View key={`empty-${index}`} className="h-[48px] w-[31%] mb-2" />
                  );
                }

                if (item.val === "back") {
                  return (
                    <Pressable
                      accessibilityRole="button"
                      key="back-key"
                      onPress={onOtpBackspace}
                      className="h-[48px] w-[31%] mb-2 items-center justify-center"
                    >
                      <Ionicons color="#111111" name="backspace-outline" size={24} />
                    </Pressable>
                  );
                }

                return (
                  <Pressable
                    accessibilityRole="button"
                    key={item.val}
                    onPress={() => onOtpDigit(item.val)}
                    className="h-[48px] w-[31%] mb-2 items-center justify-center bg-white rounded-[6px] shadow-sm"
                    style={{
                      elevation: 1,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 1,
                    }}
                  >
                    <View className="items-center">
                      <Text className="text-[22px] font-normal text-[#111111] leading-[26px]">
                        {item.val}
                      </Text>
                      {item.sub ? (
                        <Text className="text-[8px] font-bold tracking-[1px] text-[#80858E] mt-[-4px]">
                          {item.sub}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
            {/* Small handle to dismiss the keypad */}
            <Pressable 
              onPress={() => setIsKeypadVisible(false)}
              className="items-center py-2"
            >
              <View className="w-10 h-1 bg-gray-300 rounded-full" />
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </BottomDrawer>
  );
}
