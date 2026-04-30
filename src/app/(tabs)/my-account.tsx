import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AccountIcon,
  type AccountIconName,
} from "@/components/account/account-icon";

// Only kept for values NativeWind can't express
const SWITCH = {
  thumbColor: "#FFFFFF",
  trackOff: "#D1D1D6",
  trackOn: "#34C759",
} as const;

const accountFont = Platform.select({
  ios: "SF Pro Display",
  android: "sans-serif",
  web: "SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  default: undefined,
});

const fontStyle = { fontFamily: accountFont } as const;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RowIconSlot({
  icon,
  customElement,
}: {
  icon?: AccountIconName;
  customElement?: React.ReactNode;
}) {
  return (
    <View className="w-7 items-center justify-center">
      {customElement ??
        (icon && <AccountIcon color="#000000" name={icon} size={21} />)}
    </View>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <Text
      className="text-black text-[17px] font-bold mb-3 px-5"
      style={fontStyle}
    >
      {label}
    </Text>
  );
}

function Divider() {
  return (
    <View
      className="mx-5 mt-3 mb-5 bg-[rgba(0,0,0,0.05)]"
      style={{ height: 0.5 }}
    />
  );
}

function ChevronRow({
  icon,
  customIcon,
  label,
  isLast = false,
  onPress,
}: {
  icon?: AccountIconName;
  customIcon?: React.ReactNode;
  label: string;
  isLast?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.55}
      onPress={onPress}
      className={`flex-row items-center justify-between bg-white px-5 py-[3px] min-h-[35px]${
        isLast ? "" : " border-b border-[rgba(0,0,0,0.06)]"
      }`}
    >
      <View className="flex-1 flex-row items-center gap-[14px]">
        <RowIconSlot customElement={customIcon} icon={icon} />
        <Text className="flex-1 text-black text-[15px]" style={fontStyle}>
          {label}
        </Text>
      </View>
      <View className="w-6 items-end justify-center">
        <AccountIcon color="#C7C7CC" name="chevron-forward" size={17} />
      </View>
    </TouchableOpacity>
  );
}

function ToggleRow({
  icon,
  label,
  value,
  onChange,
  isLast = false,
}: {
  icon: AccountIconName;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  isLast?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center justify-between bg-white px-5 py-[3px] min-h-[35px]${
        isLast ? "" : " border-b border-[rgba(0,0,0,0.06)]"
      }`}
    >
      <View className="flex-1 flex-row items-center gap-[14px]">
        <RowIconSlot icon={icon} />
        <Text className="flex-1 text-black text-[15px]" style={fontStyle}>
          {label}
        </Text>
      </View>
      <Switch
        ios_backgroundColor={SWITCH.trackOff}
        onValueChange={onChange}
        thumbColor={SWITCH.thumbColor}
        trackColor={{ false: SWITCH.trackOff, true: SWITCH.trackOn }}
        value={value}
        style={
          Platform.OS === "android"
            ? { transform: [{ scale: 0.85 }] }
            : undefined
        }
      />
    </View>
  );
}

function ValueRow({
  icon,
  customIcon,
  label,
  value,
  isLast = false,
}: {
  icon?: AccountIconName;
  customIcon?: React.ReactNode;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.55}
      className={`flex-row items-center justify-between bg-white px-5 py-[3px] min-h-[35px]${
        isLast ? "" : " border-b border-[rgba(0,0,0,0.06)]"
      }`}
    >
      <View className="flex-1 flex-row items-center gap-[14px]">
        <RowIconSlot customElement={customIcon} icon={icon} />
        <Text className="flex-1 text-black text-[15px]" style={fontStyle}>
          {label}
        </Text>
      </View>
      <View className="flex-row items-center gap-1 pr-0.5">
        <Text className="text-[#007AFF] text-[15px]" style={fontStyle}>
          {value}
        </Text>
        <View className="w-[18px] items-center justify-center">
          <AccountIcon color="#007AFF" name="edit-outline" size={16} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function MyAccountScreen() {
  const router = useRouter();
  const [receiveNotifs, setReceiveNotifs] = useState(false);
  const [locationContent, setLocationContent] = useState(false);

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <SafeAreaView edges={["top"]} className="bg-black">
        <View className="h-11 items-center justify-center bg-black px-4">
          <Text
            className="text-white text-base font-semibold text-center"
            style={fontStyle}
          >
            Account
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        contentOffset={{ x: 0, y: 130 }}
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-white"
      >
        {/* Hidden header (revealed on scroll-up) */}
        <View className="w-full bg-[#161616]">
          <View className="px-5 pt-4 pb-6 items-center">
            <Text className="text-white text-base mb-5" style={fontStyle}>
              Welcome to{" "}
              <Text
                className="font-extrabold italic text-[18px]"
                style={[fontStyle, { letterSpacing: -0.5 }]}
              >
                ticketmaster
              </Text>
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-[#026CDF] w-full h-12 rounded-[4px] items-center justify-center"
            >
              <Text className="text-white text-base font-semibold">
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-6" />

        {/* Notifications */}
        <SectionHeader label="Notifications" />
        <View className="bg-white">
          <ChevronRow icon="envelope-outline" label="My Notifications" />
          <ToggleRow
            icon="bell-outline"
            isLast
            label="Receive Notifications?"
            onChange={setReceiveNotifs}
            value={receiveNotifs}
          />
        </View>

        <Divider />

        {/* Location Settings */}
        <SectionHeader label="Location Settings" />
        <View className="bg-white">
          <ValueRow
            icon="location-outline"
            label="My Location"
            value="Los Angeles, CA"
          />
          <ValueRow
            customIcon={
              <View className="w-[22px] h-[22px] rounded-full bg-[#E5E5E5] items-center justify-center overflow-hidden border-[0.5px] border-[#CCCCCC]">
                <Text style={{ fontSize: 13, lineHeight: 18 }}>🇺🇸</Text>
              </View>
            }
            label="My Country"
            value="United States"
          />
          <ToggleRow
            icon="paper-plane-outline"
            isLast
            label="Location Based Content"
            onChange={setLocationContent}
            value={locationContent}
          />
        </View>

        <Divider />

        {/* Preferences */}
        <SectionHeader label="Preferences" />
        <View className="bg-white">
          <ChevronRow icon="heart-outline" label="My Favourites" />
          <ChevronRow
            icon="create-outline"
            label="Edit Details"
            onPress={() => router.push("/admin")}
          />
          <ChevronRow icon="shield-checkmark-outline" label="Security" />
          <ChevronRow icon="card-outline" label="Saved Payment Methods" />
          <ChevronRow
            customIcon={
              <View className="w-5 h-5 rounded-[4px] border-[1.5px] border-black items-center justify-center">
                <Text
                  className="text-black font-bold"
                  style={[
                    fontStyle,
                    {
                      fontSize: 14,
                      lineHeight: 16,
                      includeFontPadding: false,
                    } as any,
                  ]}
                >
                  t
                </Text>
              </View>
            }
            isLast
            label="Change App Icon"
          />
        </View>

        <Divider />

        {/* Help */}
        <SectionHeader label="Help & Guidance" />
        <View className="bg-white">
          <ChevronRow icon="help-circle-outline" label="Help Center" isLast />
        </View>

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
