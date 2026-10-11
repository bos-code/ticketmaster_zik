import { Text } from '@/components/ui/app-text';
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, Platform, Pressable, Share, StyleSheet, View } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from "react-native-svg";

import { EditableText } from "@/components/tickets/EditableText";
import { useTicketFlowData } from "@/components/tickets/useTicketFlowData";

export function PromoCard() {
  const { event } = useTicketFlowData();
  const featureImage = event.heroImage;
  const [shareFeedback, setShareFeedback] = useState('');
  async function shareGoing() {
    const message = `I'm going to ${event.title}!\n${event.dateTime}\n${event.venue}`;
    try {
      if (Platform.OS === 'web' && typeof navigator.share !== 'function') {
        await navigator.clipboard.writeText(message);
        setShareFeedback('Event details copied. Paste them into your post.');
      } else {
        await Share.share({ title: event.title, message });
        setShareFeedback('');
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) {
        setShareFeedback('Sharing is unavailable. Please try again.');
      }
    }
  }
  const formattedDate = event.dateTime.replace(
    /, (\d{1,2}:\d{2}\s[AP]M)$/,
    ", / $1",
  );

  return (
    <View className="mx-4 mb-5 mt-4 overflow-hidden">
      <View className="relative min-h-[235px] overflow-hidden justify-center bg-[#111111] p-4">
        <Image
          source={featureImage}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        <View
          style={[StyleSheet.absoluteFillObject, { pointerEvents: "none" }]}
        >
          <Svg height="100%" width="100%">
            <Defs>
              <LinearGradient
                id="ticketPromoFade"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <Stop offset="0%" stopColor="#000000" stopOpacity="0.15" />
                <Stop offset="50%" stopColor="#000000" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0.65" />
              </LinearGradient>
            </Defs>
            <Rect fill="url(#ticketPromoFade)" height="100%" width="100%" />
          </Svg>
        </View>

        <View className="flex-row items-center">
          <View className="w-[65%] overflow-hidden shadow-2xl rounded-[2px] bg-[#1c1c1e]">
            <View className="relative h-[145px] w-full">
              <Image
                source={featureImage}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
              <View className="absolute inset-0 bg-black/10" />

              <View className="absolute bottom-0 left-0 bg-[#1c1c1e] px-4 py-[6px] rounded-tr-[2px]">
                <EditableText
                  value={formattedDate}
                  className="text-[8px] font-extrabold uppercase tracking-widest text-white"
                  numberOfLines={1}
                />
              </View>
            </View>

            <View className="bg-[#121213] px-3 pb-4 pt-3">
              <EditableText
                field="eventName"
                value={event.title}
                className="mb-[6px] text-[12px] font-black uppercase leading-[18px] text-white"
                numberOfLines={2}
              />
              <EditableText
                field="venue"
                value={event.venue}
                className="text-[10px] font-medium text-[#A0A0A0]"
                numberOfLines={1}
              />
            </View>
          </View>

          <View className="flex-1 pl-3 justify-center">
            <Text className="text-[15px] font-black uppercase tracking-[1px] text-white">
              YOU GOT{"\n"}TICKETS!
            </Text>
            <View className="mt-2 h-[4px] w-full max-w-[85px] bg-[#D8B18B]" />
          </View>
        </View>
      </View>

      <View className="bg-[#242424]">
        <View className="px-5 pb-6 pt-5">
          <Text className="mb-2 text-[16px] font-extrabold text-white">
            Post on Social Media
          </Text>
          <Text className="text-[14px] pt-2 font-medium leading-[21px] text-[#BBBBBB]">
            Build hype for the event, and share that you got tickets with your
            friends and family.
          </Text>
        </View>
        <Pressable accessibilityRole="button" onPress={shareGoing} className="flex-row items-center justify-center border-t border-[#171717] py-4">
          <Text className="mr-2 text-[15px] font-bold text-white">
            Share You&apos;re Going
          </Text>
          <Ionicons name="share-outline" size={20} color="#FFFFFF" />
        </Pressable>
        {!!shareFeedback && <Text accessibilityLiveRegion="polite" className="px-5 pb-4 text-[13px] text-[#CCCCCC]">{shareFeedback}</Text>}
      </View>
    </View>
  );
}
