import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from "react-native-svg";

import { useTicketFlowData } from "@/components/tickets/useTicketFlowData";
import { EditableText } from "@/components/tickets/EditableText";

export function PromoCard() {
  const { event } = useTicketFlowData();
  const formattedDate = event.dateTime.replace(/, (\d{1,2}:\d{2}\s[AP]M)$/, ", / $1");

  return (
    <View className="mx-[22px] mb-24 mt-4 overflow-hidden rounded-[4px] border border-[#f0f0f0]">
      <View className="relative h-[220px] overflow-hidden justify-end px-4">
        <Image
          source={event.heroImage}
          style={{
            position: "absolute",
            top: -30,
            left: -30,
            right: -30,
            bottom: -30,
            width: "auto",
            height: "auto",
          }}
          blurRadius={100}
          resizeMode="cover"
        />
        <View style={[StyleSheet.absoluteFillObject, { pointerEvents: "none" }]}>
          <Svg height="100%" width="100%">
            <Defs>
              <LinearGradient id="ticketPromoFade" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#000000" stopOpacity="0.1" />
                <Stop offset="50%" stopColor="#000000" stopOpacity="0.6" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0.95" />
              </LinearGradient>
              <RadialGradient
                cx="50%"
                cy="50%"
                fx="50%"
                fy="50%"
                id="ticketPromoVignette"
                r="75%"
              >
                <Stop offset="0%" stopColor="#000000" stopOpacity="0" />
                <Stop offset="60%" stopColor="#000000" stopOpacity="0.15" />
                <Stop offset="85%" stopColor="#000000" stopOpacity="0.5" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0.85" />
              </RadialGradient>
              <RadialGradient
                cx="50%"
                cy="50%"
                fx="50%"
                fy="50%"
                id="ticketPromoSmoke"
                r="70%"
              >
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.11" />
                <Stop offset="38%" stopColor="#FFFFFF" stopOpacity="0.055" />
                <Stop offset="70%" stopColor="#000000" stopOpacity="0.45" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0.95" />
              </RadialGradient>
            </Defs>
            <Rect fill="url(#ticketPromoFade)" height="100%" width="100%" />
            <Rect fill="url(#ticketPromoVignette)" height="100%" width="100%" />
            <Rect fill="url(#ticketPromoSmoke)" height="100%" width="100%" />
          </Svg>
        </View>

        <View className="flex-row items-center">
          <View className="w-[65%] overflow-hidden shadow-2xl rounded-[2px] bg-[#1c1c1e]">
            <View className="relative h-[145px] w-full">
              <Image
                source={event.heroImage}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
              <View className="absolute inset-0 bg-black/10" />

              <View className="absolute bottom-0 left-0 bg-[#1c1c1e] px-4 py-[6px] rounded-tr-[2px]">
                  <EditableText value={formattedDate} className="text-[8px] font-extrabold uppercase tracking-widest text-white" numberOfLines={1} />
              </View>
            </View>

            <View className="bg-[#121213] px-3 pb-4 pt-3">
              <EditableText field="eventName" value={event.title} className="mb-[6px] text-[12px] font-black uppercase leading-[18px] text-white" numberOfLines={2} />
              <EditableText field="venue" value={event.venue} className="text-[10px] font-medium text-[#A0A0A0]" numberOfLines={1} />
            </View>
          </View>

          <View className="flex-1 pl-7 justify-center">
            <Text className="text-[15px] font-black uppercase leading-[26px] tracking-[1px] text-white">
              YOU GOT{"\n"}TICKETS!
            </Text>
            <View className="mt-3 h-[6px] w-[85px] bg-white" />
          </View>
        </View>
      </View>

      <View className="bg-[#f7f7f7]">
        <View className="px-5 pb-6 pt-5">
          <Text className="mb-2 text-[15px] font-extrabold text-[#111111]">
            Post on Social Media
          </Text>
          <Text className="text-[12px] pt-2 font-medium leading-[19px] text-[#444444]">
            Build hype for the event, and share that you got tickets with your friends and family.
          </Text>
        </View>
        <Pressable className="flex-row items-center justify-center border-t-2 border-white py-4">
          <Text className="mr-2 text-[14px] font-medium text-[#111111]">
            Share You&apos;re Going
          </Text>
          <Ionicons name="share-outline" size={20} color="#111111" />
        </Pressable>
      </View>
    </View>
  );
}
