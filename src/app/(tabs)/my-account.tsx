import { useRouter } from "expo-router";
import enCountryData from "i18n-iso-countries/langs/en.json";
import * as countries from "i18n-iso-countries";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CountryFlag from "react-native-country-flag";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AccountIcon,
  type AccountIconName,
} from "@/components/account/account-icon";
import { StatusBarChrome } from "@/components/status-bar-chrome";
import {
  getLocationPermissionStatus,
  resolveHomeLocation,
} from "@/lib/device-permissions";
import { useAppStore } from "@/store/use-app-store";



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
const WELCOME_PANEL_LOCK_HEIGHT = 132;
const COUNTRY_LANGUAGE = "en";

countries.registerLocale(enCountryData);

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

function CountryFlagCircle({ countryCode }: { countryCode?: string }) {
  if (!countryCode) {
    return <AccountIcon color="#000000" name="flag-outline" size={21} />;
  }

  return (
    <View className="h-[22px] w-[22px] items-center justify-center overflow-hidden rounded-full border border-[rgba(0,0,0,0.08)] bg-[#F2F4F7]">
      <CountryFlag isoCode={countryCode} size={22} />
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
  onChange: (value: boolean) => void;
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
  busy = false,
  icon,
  customIcon,
  label,
  onPress,
  value,
  isLast = false,
}: {
  busy?: boolean;
  icon?: AccountIconName;
  customIcon?: React.ReactNode;
  label: string;
  onPress?: () => void;
  value: string;
  isLast?: boolean;
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
      <View className="flex-row items-center gap-1 pr-0.5">
        <Text className="text-[#007AFF] text-[15px]" style={fontStyle}>
          {value}
        </Text>
        <View className="w-[18px] items-center justify-center">
          {busy ? (
            <ActivityIndicator color="#007AFF" size="small" />
          ) : (
            <AccountIcon color="#007AFF" name="edit-outline" size={16} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MyAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView | null>(null);
  const scrollOffsetYRef = useRef(WELCOME_PANEL_LOCK_HEIGHT);
  const [receiveNotifs, setReceiveNotifs] = useState(false);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const homeLocationLabel = useAppStore((state) => state.homeLocationLabel);
  const locationEnabled = useAppStore((state) => state.locationEnabled);
  const setHomeLocationLabel = useAppStore((state) => state.setHomeLocationLabel);
  const setLocationEnabled = useAppStore((state) => state.setLocationEnabled);

  useEffect(() => {
    let isActive = true;

    async function syncLocationState() {
      const locationStatus = await getLocationPermissionStatus();

      if (!isActive) {
        return;
      }

      if (locationStatus === "granted") {
        setLocationEnabled(true);

        const result = await resolveHomeLocation({ requestIfNeeded: false });
        if (!isActive) {
          return;
        }

        if (result.granted && result.label) {
          setHomeLocationLabel(result.label);
        }
        return;
      }

      setLocationEnabled(false);
    }

    void syncLocationState();

    return () => {
      isActive = false;
    };
  }, [setHomeLocationLabel, setLocationEnabled]);

  const locationDetails = useMemo(
    () => splitLocationLabel(homeLocationLabel),
    [homeLocationLabel],
  );

  async function refreshLocationDetails(requestIfNeeded: boolean) {
    if (isRefreshingLocation) {
      return;
    }

    setIsRefreshingLocation(true);
    const result = await resolveHomeLocation({ requestIfNeeded });

    if (result.granted) {
      setLocationEnabled(true);
      if (result.label) {
        setHomeLocationLabel(result.label);
      }
    } else {
      setLocationEnabled(false);
      Alert.alert(
        "Location access",
        result.error ?? "Unable to update your location details right now.",
      );
    }

    setIsRefreshingLocation(false);
  }

  async function handleLocationToggle(nextValue: boolean) {
    if (!nextValue) {
      setLocationEnabled(false);
      return;
    }

    await refreshLocationDetails(true);
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBarChrome backgroundColor="#000000" style="light" />

      <View style={{ backgroundColor: "#000000", paddingTop: Math.max(insets.top, 12) }}>
        <View className="h-11 items-center justify-center bg-black px-4">
          <Text
            className="text-white text-base font-semibold text-center"
            style={fontStyle}
          >
            Account
          </Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        alwaysBounceVertical
        contentContainerStyle={{ paddingBottom: 32 }}
        contentOffset={{ x: 0, y: WELCOME_PANEL_LOCK_HEIGHT }}
        decelerationRate="fast"
        onScroll={(event) => {
          scrollOffsetYRef.current = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        snapToOffsets={[0, WELCOME_PANEL_LOCK_HEIGHT]}
        className="flex-1 bg-white"
      >
        <View className="w-full bg-[#000000]">
          <View
            className="px-5 pt-4 pb-6 items-center"
            style={{ minHeight: WELCOME_PANEL_LOCK_HEIGHT }}
          >
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

        <SectionHeader label="Location Settings" />
        <View className="bg-white">
          <ValueRow
            busy={isRefreshingLocation}
            icon="location-outline"
            label="My Location"
            onPress={() => void refreshLocationDetails(true)}
            value={locationDetails.location}
          />
          <ValueRow
            busy={isRefreshingLocation}
            customIcon={
              <CountryFlagCircle countryCode={locationDetails.countryCode} />
            }
            label="My Country"
            onPress={() => void refreshLocationDetails(true)}
            value={locationDetails.country}
          />
          <ToggleRow
            icon="paper-plane-outline"
            isLast
            label="Location Based Content"
            onChange={(value) => void handleLocationToggle(value)}
            value={locationEnabled}
          />
        </View>

        <Divider />

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
                    } as const,
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

        <SectionHeader label="Help & Guidance" />
        <View className="bg-white">
          <ChevronRow icon="help-circle-outline" label="Help Center" isLast />
        </View>

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}

function splitLocationLabel(label: string) {
  const parts = label
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    return {
      location: "Unavailable",
      country: "Unavailable",
      countryCode: undefined,
    };
  }

  const rawCountry = parts[parts.length - 1] ?? "";
  const location =
    parts.length > 1 ? parts.slice(0, -1).join(", ") : parts[0];
  const countryCode = resolveCountryCode(rawCountry);

  return {
    location,
    country: resolveCountryName(rawCountry, countryCode),
    countryCode,
  };
}

function resolveCountryName(value: string, countryCode?: string) {
  const normalized = value.trim();

  if (!normalized) {
    return "Unavailable";
  }

  if (countryCode) {
    return countries.getName(countryCode, COUNTRY_LANGUAGE) ?? countryCode;
  }

  return normalized;
}

function resolveCountryCode(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return undefined;
  }

  if (/^[A-Za-z]{2}$/.test(normalized)) {
    return normalized.toUpperCase();
  }

  return countries.getAlpha2Code(normalized, COUNTRY_LANGUAGE)?.toUpperCase();
}
