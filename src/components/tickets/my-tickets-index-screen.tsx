import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  selectTicketReservations,
  useEventStore,
} from "@/store/use-event-store";

type TicketIndexTab = "upcoming" | "past";

export function MyTicketsIndexScreen() {
  const router = useRouter();
  const reservations = useEventStore(selectTicketReservations);

  const upcomingEvents = useMemo(
    () =>
      reservations.filter((reservation) => reservation.status === "upcoming"),
    [reservations],
  );

  const pastEvents = useMemo(
    () => reservations.filter((reservation) => reservation.status === "past"),
    [reservations],
  );

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
      ? "Reservations for events that have not happened yet will show up here."
      : "Tickets you have already used will show up here.";

  return (
    <View className="flex-1 ">
      <StatusBar backgroundColor="#050505"  />

      <SafeAreaView edges={["top", "left", "right"]} className="flex-1">
        <View className="relative z-10 h-[128px] bg-[#050505] overflow-visible ">
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
            visibleEvents.map((event) => (
              <Pressable
                accessibilityRole="button"
                className="w-full overflow-hidden"
                key={event.id}
                onPress={() =>
                  router.push({
                    pathname: "/tickets",
                    params: { reservationId: event.id },
                  })
                }
              >
                <View className="relative ">
                  <Image
                    className="h-64 w-full bg-[#1A1A1A]"
                    resizeMode="cover"
                    source={{ uri: event.event.imageUrl }}
                  />
                  <View className="absolute bottom-0 left-0 bg-[#101010] p-3">
                    <Text className="text-base font-black uppercase leading-3 tracking-[0.6px] text-white">
                      {event.event.date}
                    </Text>
                  </View>
                </View>

                <View className="bg-[#101010] px-[14px] pb-[18px] pt-[22px]">
                  <Text className="text-3xl font-black uppercase leading-[25px] text-white">
                    {event.event.title}
                  </Text>

                  <View className="mt-[10px] h-[3px] w-52 bg-[#B79E6A]" />

                  <Text className="mt-[13px] text-base font-medium leading-[15px] text-[rgba(255,255,255,0.88)]">
                    {event.event.venue}
                  </Text>
                </View>
              </Pressable>
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
        className={`mt-[9px] -m-3  h-[2px] w-[120%] ${
          active ? "bg-white" : "bg-transparent"
        }`}
      />
    </Pressable>
  );
}
