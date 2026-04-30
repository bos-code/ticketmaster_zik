import React from "react";
import { Image, Text, View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

import { useTicketFlowData } from "@/components/tickets/useTicketFlowData";

export function PromoCard() {
  const { event } = useTicketFlowData();

  return (
    <View className="mx-4 mt-5 h-[190px] overflow-hidden bg-[#09090A]">
      <View className="absolute inset-0 bg-[#080809]" />
      <View className="absolute inset-0 flex-row">
        <View className="w-[62%] bg-[#101010]">
          <View className="relative h-[112px] overflow-hidden bg-black">
            <Image
              resizeMode="cover"
              source={{ uri: event.imageUrl }}
              style={{ height: "100%", opacity: 0.68, width: "100%" }}
            />
            <View className="absolute inset-0 bg-[rgba(0,0,0,0.22)]" />
            <View className="absolute bottom-0 left-0 bg-black px-[10px] py-[7px]">
              <Text
                className="text-[9px] font-black uppercase leading-[11px] text-white"
                numberOfLines={1}
                style={{ letterSpacing: 0.9 }}
              >
                {event.dateTime}
              </Text>
            </View>
          </View>

          <View className="flex-1 bg-[#101010] px-[10px] pt-[10px]">
            <Text
              className="text-[14px] font-black uppercase leading-[16px] text-white"
              numberOfLines={1}
              style={{ letterSpacing: 0.55 }}
            >
              {event.title}
            </Text>
            <View className="mt-[6px] h-[2px] w-[98px] bg-[#B79E6A]" />

            <Text
              className="mt-[7px] text-[12px] font-medium leading-[14px] text-[#BCB9BD]"
              numberOfLines={1}
            >
              {event.venue}
            </Text>
          </View>
        </View>

        <View className="relative flex-1 overflow-hidden bg-[#060607]">
          <Image
            blurRadius={24}
            resizeMode="cover"
            source={{ uri: event.imageUrl }}
            style={{
              bottom: -24,
              left: -34,
              opacity: 0.25,
              position: "absolute",
              right: -34,
              top: -24,
            }}
          />
          <View pointerEvents="none" className="absolute inset-0">
            <Svg height="100%" width="100%">
              <Defs>
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
                  <Stop offset="72%" stopColor="#000000" stopOpacity="0.35" />
                  <Stop offset="100%" stopColor="#000000" stopOpacity="0.88" />
                </RadialGradient>
              </Defs>
              <Rect fill="url(#ticketPromoSmoke)" height="100%" width="100%" />
            </Svg>
          </View>
          <View className="absolute -right-10 top-3 h-40 w-36 rounded-full bg-[rgba(255,255,255,0.055)]" />
          <View className="absolute left-5 top-8 h-28 w-36 rounded-full bg-[rgba(255,255,255,0.04)]" />

          <View className="flex-1 justify-center px-[28px]">
            <Text
              className="text-left text-[19px] font-black uppercase leading-[20px] text-white"
              style={{ letterSpacing: 1.15 }}
            >
              YOU GOT{"\n"}TICKETS!
            </Text>

            <View className="mt-[14px] h-[5px] w-[96px] bg-white" />
          </View>
        </View>
      </View>

      <View pointerEvents="none" className="absolute inset-0">
        <Svg height="100%" width="100%">
          <Defs>
            <RadialGradient
              cx="50%"
              cy="44%"
              fx="50%"
              fy="44%"
              id="ticketPromoVignette"
              r="78%"
            >
              <Stop offset="0%" stopColor="#000000" stopOpacity="0" />
              <Stop offset="58%" stopColor="#000000" stopOpacity="0.02" />
              <Stop offset="84%" stopColor="#000000" stopOpacity="0.28" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0.62" />
            </RadialGradient>
          </Defs>
          <Rect fill="url(#ticketPromoVignette)" height="100%" width="100%" />
        </Svg>
      </View>
    </View>
  );
}
