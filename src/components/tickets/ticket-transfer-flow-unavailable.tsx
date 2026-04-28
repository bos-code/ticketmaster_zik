import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function TicketsUnavailable() {
  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={{ flex: 1, backgroundColor: "#F5F2EF" }}
    >
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full max-w-[360px] rounded-[16px] border border-[#E6DFD9] bg-white px-5 py-6">
          <Text className="text-[13px] font-bold uppercase leading-[16px] text-[#0B55F5]">
            My Tickets
          </Text>
          <Text className="mt-3 text-[22px] font-extrabold leading-7 text-[#111111]">
            No reservation is available yet.
          </Text>
          <Text className="mt-3 text-[14px] font-medium leading-5 text-[#5B6470]">
            Reserve a ticket from discovery first, then open it from My Tickets
            to view the full details flow.
          </Text>
          <Pressable
            accessibilityRole="button"
            className="mt-6 min-h-[46px] items-center justify-center rounded-[10px] bg-[#0B55F5]"
            onPress={() => router.replace("/discover")}
          >
            <Text className="text-[14px] font-semibold leading-[18px] text-white">
              Back to Discover
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
