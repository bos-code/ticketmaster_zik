import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function TicketsLoadingShadow() {
  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={{ flex: 1, backgroundColor: "#F5F2EF" }}
    >
      <View style={styles.loadingScreen}>
        <View style={styles.heroShadow} />

        <View style={styles.summaryShadowCard}>
          <View style={[styles.shadowBar, styles.shadowDate]} />
          <View style={[styles.shadowBar, styles.shadowTitle]} />
          <View style={[styles.shadowBar, styles.shadowVenue]} />
          <View style={[styles.shadowBar, styles.shadowButton]} />
        </View>

        <View style={styles.listShadowCard}>
          <View style={[styles.shadowBar, styles.shadowListTitle]} />
          <View style={[styles.shadowBar, styles.shadowListLine]} />
          <View style={[styles.shadowBar, styles.shadowListLineShort]} />
        </View>
      </View>
    </SafeAreaView>
  );
}

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
            No ticket order is available yet.
          </Text>
          <Text className="mt-3 text-[14px] font-medium leading-5 text-[#5B6470]">
            Open this flow from My Tickets after a ticket order has been loaded.
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

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 28,
  },
  heroShadow: {
    backgroundColor: "#E9EDF2",
    height: 286,
    marginHorizontal: -18,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  summaryShadowCard: {
    backgroundColor: "#FFFFFF",
    marginTop: -34,
    padding: 18,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  listShadowCard: {
    backgroundColor: "#FFFFFF",
    marginTop: 18,
    padding: 18,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  shadowBar: {
    backgroundColor: "#E5E9EF",
  },
  shadowDate: {
    height: 22,
    width: 72,
  },
  shadowTitle: {
    height: 26,
    marginTop: 18,
    width: "82%",
  },
  shadowVenue: {
    height: 16,
    marginTop: 14,
    width: "62%",
  },
  shadowButton: {
    height: 42,
    marginTop: 22,
    width: "100%",
  },
  shadowListTitle: {
    height: 18,
    width: "42%",
  },
  shadowListLine: {
    height: 16,
    marginTop: 18,
    width: "78%",
  },
  shadowListLineShort: {
    height: 16,
    marginTop: 10,
    width: "56%",
  },
});
