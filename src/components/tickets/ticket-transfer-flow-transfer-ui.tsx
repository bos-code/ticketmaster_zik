import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import Animated, {
  Easing,
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  absoluteFill,
  cx,
  useTicketFlowData,
  type Seat,
} from "@/components/tickets/ticket-flow-shared";
export function CompactHeroHeader({
  onBack,
  onOpenViewer,
}: {
  onBack: () => void;
  onOpenViewer?: () => void;
}) {
  const { event } = useTicketFlowData();

  return (
    <View className="overflow-hidden bg-[#050505]">
      <SafeAreaView edges={["top"]} style={{ backgroundColor: "#050505" }}>
        <View className="relative min-h-[106px] overflow-hidden">
          <Image
            contentFit="cover"
            source={{ uri: event.imageUrl }}
            style={absoluteFill}
          />
          <View className="absolute inset-0 bg-[rgba(3,3,6,0.56)]" />

          <View className="relative flex-1 justify-center px-4">
            <View className="min-h-[44px] flex-row items-center justify-between">
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={onBack}
                className="h-10 w-10 items-center justify-center rounded-full bg-[rgba(0,0,0,0.30)]"
              >
                <Ionicons color="#FFFFFF" name="arrow-back" size={20} />
              </Pressable>

              <View className="absolute left-14 right-14 items-center">
                <Text
                  numberOfLines={1}
                  className="text-center text-[13px] font-extrabold leading-[16px] text-white"
                >
                  {event.title}
                </Text>
                <Text
                  numberOfLines={1}
                  className="mt-[2px] text-center text-[11px] font-normal leading-[13px] text-[rgba(255,255,255,0.84)]"
                >
                  {event.venue}
                </Text>
              </View>

              {onOpenViewer ? (
                <Pressable
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={onOpenViewer}
                  className="h-11 w-11 items-center justify-center rounded-[14px] bg-[#0B55F5]"
                >
                  <Ionicons color="#FFFFFF" name="barcode-outline" size={20} />
                </Pressable>
              ) : (
                <View className="h-10 w-10" />
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

export function TransferScaffold({
  children,
  onBack,
  onPrimaryPress,
}: {
  children: React.ReactNode;
  onBack: () => void;
  onPrimaryPress: () => void;
}) {
  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={{ flex: 1, backgroundColor: "#F5F2EF" }}
    >
      <View className="flex-1 bg-[#F5F2EF]">
        <CompactHeroHeader onBack={onBack} onOpenViewer={onPrimaryPress} />
        <View className="flex-1 bg-white">{children}</View>
      </View>
    </SafeAreaView>
  );
}

export function BackLink({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center gap-[2px]"
      onPress={onPress}
    >
      <Ionicons color="#2A84C6" name="chevron-back" size={17} />
      <Text className="text-[12px] font-medium leading-[14px] text-[#2A84C6]">
        BACK
      </Text>
    </Pressable>
  );
}

export function Field({
  keyboardType,
  label,
  onChangeText,
  placeholder,
  value,
}: {
  keyboardType?: "default" | "email-address" | "phone-pad";
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View className="gap-[6px]">
      <Text className="text-[12px] font-semibold leading-[14px] text-[#171717]">
        {label}
      </Text>
      <TextInput
        className="min-h-[36px] border border-[#C9CCD2] px-[10px] py-2 text-[14px] text-[#111111]"
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#C4C8CE"
        value={value}
      />
    </View>
  );
}

export function OtpIllustration() {
  return (
    <View className="relative min-h-[178px] items-center justify-center overflow-hidden bg-[#181823]">
      <View className="relative min-h-[88px] min-w-[190px] items-center justify-center rounded-[34px] bg-white px-[22px]">
        <View className="flex-row gap-[7px]">
          {[0, 1, 2, 3].map((index) => (
            <View
              className={cx(
                "h-[34px] w-[34px] items-center justify-center rounded-[6px] bg-[#0A6AE4]",
                index === 3 && "opacity-80",
              )}
              key={index}
            >
              {index < 3 ? (
                <Text className="text-[20px] font-extrabold leading-[22px] text-white">
                  *
                </Text>
              ) : null}
            </View>
          ))}
        </View>
        <View
          className="absolute left-7 h-5 w-5 rounded-bl-[10px] bg-white"
          style={{ bottom: -12, transform: [{ rotate: "32deg" }] }}
        />
      </View>

      <View className="absolute right-[70px] top-[68px]">
        <View
          className="h-5 w-5 self-center border-x-4 border-t-4 border-[#F3C746]"
          style={{
            borderBottomWidth: 0,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        />
        <View className="-mt-[2px] h-[34px] w-[30px] items-center justify-center rounded-[8px] bg-[#F8D65B]">
          <Ionicons color="#D7A311" name="lock-closed" size={18} />
        </View>
      </View>
    </View>
  );
}

export function TicketCard({
  cardWidth,
  index,
  seat,
}: {
  cardWidth: number;
  index: number;
  seat: Seat;
}) {
  const { event } = useTicketFlowData();

  return (
    <Animated.View
      entering={FadeInDown.duration(280).delay(40 + index * 70)}
      className="mr-[14px] overflow-hidden rounded-[10px] border border-[#E6DFD9] bg-[#FBF8F5]"
      style={{ width: cardWidth }}
    >
      <View className="h-[10px] bg-[#0458F7]" />

      <View className="bg-white px-[10px] pt-2">
        <View className="mb-2 flex-row items-center justify-center">
          <Text className="mr-1 text-[11px] font-medium leading-[14px] text-[#6B6B6B]">
            Screenshots won&apos;t get you in
          </Text>
          <Ionicons color="#5A5A5A" name="refresh-outline" size={12} />
        </View>
        <TicketQrBand seat={seat} />
      </View>

      <Image
        contentFit="cover"
        source={{ uri: event.imageUrl }}
        style={{ height: 300, width: "100%" }}
      />

      <View className="px-[14px] pb-[14px] pt-3">
        <Text className="text-[17px] font-bold leading-5 text-[#202020]">
          {seat.note}
        </Text>
        <Text className="mt-[3px] text-[12px] font-medium leading-[15px] text-[#8B8F96]">
          LOWER BOWL SEATING
        </Text>

        <View className="mt-[14px]">
          <Text className="text-[10px] font-bold leading-3 text-[#A7ACB5]">
            SECTION
          </Text>
          <Text className="mt-[10px] text-[18px] font-extrabold leading-[22px] text-[#0F0F0F]">
            {seat.section}
          </Text>
        </View>

        <View className="mt-[14px] min-h-[48px] items-center justify-center bg-[#0D0D0D]">
          <Text className="text-[15px] font-bold leading-[19px] text-white">
            LOWER BOWL SEATING
          </Text>
        </View>

        <Text className="mt-[14px] text-[12px] font-medium leading-4 text-[#8B8F96]">
          {`ROW ${seat.row}   -   SEAT ${seat.seat}`}
        </Text>
      </View>
    </Animated.View>
  );
}

function TicketQrBand({ seat }: { seat: Seat }) {
  const { event } = useTicketFlowData();
  const qrValue = `${event.shortTitle}-${seat.section}-${seat.row}-${seat.seat}`;
  const beamProgress = useSharedValue(0);

  useEffect(() => {
    beamProgress.value = withRepeat(
      withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [beamProgress]);

  const beamAnimatedStyle = useAnimatedStyle(() => {
    const seatBias = seat.seat === "2" ? -18 : seat.seat === "4" ? 18 : 0;

    return {
      transform: [
        {
          translateX: interpolate(
            beamProgress.value,
            [0, 1],
            [-34 + seatBias, 34 + seatBias],
          ),
        },
      ],
    };
  });

  return (
    <View className="relative h-16 flex-row items-center overflow-hidden bg-white">
      <View className="mr-1 h-[42px] w-[3px] bg-[#2E66F5]" />

      <View className="gap-[2px] py-[7px]">
        <View className="h-[38px] w-[5px] bg-[#101010]" />
        <View className="h-[38px] w-[2px] bg-[#101010]" />
        <View className="h-[38px] w-[2px] bg-[#101010]" />
      </View>

      <View className="flex-1 flex-row justify-center gap-[2px] px-[6px]">
        {[0, 1, 2].map((index) => (
          <View className="overflow-hidden bg-white" key={index}>
            <QRCode
              backgroundColor="#FFFFFF"
              color="#111111"
              quietZone={0}
              size={40}
              value={`${qrValue}-${index}`}
            />
          </View>
        ))}
      </View>

      <Animated.View
        className="absolute top-[10px] h-[44px] w-[6px] bg-[#2E66F5] opacity-90"
        style={[{ left: "50%" }, beamAnimatedStyle]}
      />

      <View className="gap-[2px] py-[7px]">
        <View className="h-[38px] w-[5px] bg-[#101010]" />
        <View className="h-[38px] w-[2px] bg-[#101010]" />
        <View className="h-[38px] w-[2px] bg-[#101010]" />
      </View>
    </View>
  );
}
