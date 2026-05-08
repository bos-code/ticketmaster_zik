import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { StatusBarChrome } from "@/components/status-bar-chrome";
import { useTicketOrder } from "@/hooks/useTicketOrder";
import type { TicketSummaryViewModel } from "@/types/ticket";

type TicketIndexTab = "upcoming" | "past";

export function MyTicketsIndexScreen() {
  const router = useRouter();
  const { summaryViewModel } = useTicketOrder();

  const upcomingEvents = useMemo(
    () => [summaryViewModel],
    [summaryViewModel],
  );

  const pastEvents = useMemo<TicketSummaryViewModel[]>(() => [], []);

  const [activeTab, setActiveTab] = useState<TicketIndexTab>(() =>
    upcomingEvents.length > 0 || pastEvents.length === 0 ? "upcoming" : "past",
  );

  useEffect(() => {
    if (
      activeTab === "upcoming" &&
      upcomingEvents.length === 0 &&
      pastEvents.length > 0
    ) {
      setActiveTab("past");
      return;
    }

    if (
      activeTab === "past" &&
      pastEvents.length === 0 &&
      upcomingEvents.length > 0
    ) {
      setActiveTab("upcoming");
    }
  }, [activeTab, pastEvents.length, upcomingEvents.length]);

  const visibleEvents = activeTab === "upcoming" ? upcomingEvents : pastEvents;
  const emptyTitle =
    activeTab === "upcoming"
      ? "No upcoming events yet."
      : "No past events yet.";
  const emptyBody =
    activeTab === "upcoming"
      ? "Tickets created by admin for future events will show up here."
      : "Tickets marked as past by admin will show up here.";

  return (
    <View className="flex-1 bg-white">
      <StatusBarChrome backgroundColor="#050505" style="light" />

      <SafeAreaView edges={["top", "left", "right"]} className="flex-1">
        <View className="relative z-10 h-[128px] overflow-visible bg-[#050505]">
          <View className="relative min-h-[52px] flex-row items-center justify-end px-5 pt-3">
            <View className="w-12" />

            <Text className="absolute left-0 right-0 top-[25px] text-center text-[19px] font-extrabold leading-[23px] text-white">
              My Events
            </Text>

            <Pressable
              accessibilityRole="button"
              className="min-w-12 items-end justify-center py-2"
              onPress={() => router.push("/settings")}
            >
              <Text className="text-[12px] font-bold leading-[15px] text-[rgba(255,255,255,0.92)]">
                Help
              </Text>
            </Pressable>
          </View>

          <View className="absolute inset-x-0 bottom-0 flex-row px-4">
            <TicketFilterTab
              active={activeTab === "upcoming"}
              count={upcomingEvents.length}
              label="Upcoming"
              onPress={() => setActiveTab("upcoming")}
            />

            <TicketFilterTab
              active={activeTab === "past"}
              count={pastEvents.length}
              label="Past"
              onPress={() => setActiveTab("past")}
            />
          </View>
        </View>

        <ScrollView
          contentContainerClassName="gap-5 px-4 pb-44 pt-5"
          showsVerticalScrollIndicator={true}
        >
          {visibleEvents.length ? (
            visibleEvents.map((ticket) => (
              <TicketIndexCard
                key={ticket.orderId}
                onPress={() =>
                  router.push({
                    pathname: "/tickets/index",
                    params: { orderId: ticket.orderId },
                  })
                }
                ticket={ticket}
              />
            ))
          ) : (
            <View className="mt-4 items-center gap-2 border border-[rgba(255,255,255,0.08)] bg-[#111111] px-6 py-8">
              <Text className="text-center text-[18px] font-black leading-[22px] text-white">
                {emptyTitle}
              </Text>

              <Text className="text-center text-[14px] font-semibold leading-5 text-[rgba(255,255,255,0.68)]">
                {emptyBody}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function TicketIndexCard({
  onPress,
  ticket,
}: {
  onPress: () => void;
  ticket: TicketSummaryViewModel;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className="w-full overflow-hidden"
      onPress={onPress}
    >
      <View className="relative">
        <Image
          className="h-64 w-full bg-[#1A1A1A]"
          resizeMode="cover"
          source={ticket.heroImage}
        />

        {/* <View className="absolute left-3 top-3 rounded-full bg-[#101010]/90 px-3 py-2">
          <Text className="text-[10px] font-black uppercase tracking-[1px] text-white">
            {ticket.ticketType}
          </Text>
        </View> */}
        <View className="absolute bottom-0 left-0 bg-[#101010] p-3">
          <Text className="text-base font-black uppercase leading-3 tracking-[0.6px] text-white">
            {ticket.eventFullDateTimeLabel}
          </Text>
        </View>
      </View>

      <View className="bg-[#101010] px-[14px] pb-[18px] pt-1">
        <Text className="text-2xl font-black uppercase leading-[30px] text-white">
          {ticket.eventTitle}
        </Text>

        <View className="mt-[10px] h-[3px] w-52 bg-[#B79E6A]" />

        {/* <Text className="mt-[13px] text-base font-bold leading-[19px] text-[rgba(255,255,255,0.9)]">
          {ticket.artistName} / {ticket.albumName}
        </Text> */}

        <Text className="mt-1 text-base font-medium pt-3 leading-[19px] text-[rgba(255,255,255,0.76)]">
          {ticket.eventVenue}
        </Text>
        {/* 
        <Text className="mt-3 text-[13px] font-bold leading-[18px] text-[rgba(255,255,255,0.62)]">
          Section {ticket.section} / Row {ticket.row} / {ticket.seatRange}
        </Text> */}
      </View>
    </Pressable>
  );
}

function TicketFilterTab({
  active,
  count,
  label,
  onPress,
}: {
  active: boolean;
  count: number;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={{ bottom: 12, left: 12, right: 12, top: 12 }}
      onPress={onPress}
      className="h-11 flex-1 items-center justify-end pb-[10px]"
    >
      <Text
        className={`text-center text-sm font-black uppercase leading-4 ${
          active ? "text-white" : "text-[rgba(255,255,255,0.56)]"
        }`}
      >
        {`${label.toUpperCase()}(${count})`}
      </Text>

      <View
        className={`mt-[9px] -m-3 h-[2px] w-[120%] ${
          active ? "bg-white" : "bg-transparent"
        }`}
      />
    </Pressable>
  );
}
