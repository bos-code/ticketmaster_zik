import { createContext, useContext } from "react";

import type { Ionicons } from "@expo/vector-icons";

export type FlowScreen =
  | "list"
  | "select"
  | "recipientChoice"
  | "recipientForm"
  | "viewer";
export type PanelTab = "tickets" | "extras";
export type TransferModal = "none" | "auth" | "loading";
export type DeliveryMode = "email" | "mobile";

export type Seat = {
  id: string;
  note: string;
  seat: string;
  row: string;
  section: string;
};

export type RecipientFormState = {
  destination: string;
  firstName: string;
  lastName: string;
  note: string;
};

export type TicketFlowContextValue = {
  event: {
    dateTime: string;
    headerSubtitle: string;
    id: string;
    imageUrl: string;
    mapImageUrl: string;
    shortTitle: string;
    title: string;
    venue: string;
  };
  order: {
    id: string;
    ticketCount: string;
  };
  reservationId: string;
  seats: Seat[];
};

export const EMPTY_SEATS: Seat[] = [];

export const EXTRA_CARDS = [
  {
    id: "entry",
    icon: "walk-outline" as const,
    title: "Entry Tips",
    body: "Bring a charged phone, your active ticket, and a matching photo ID for faster entry.",
  },
  {
    id: "delivery",
    icon: "phone-portrait-outline" as const,
    title: "Mobile Delivery",
    body: "Tickets stay live in-app and refresh automatically, so screenshots will not be accepted.",
  },
  {
    id: "policy",
    icon: "shield-checkmark-outline" as const,
    title: "Venue Policy",
    body: "Bag rules and door times can change. Check venue updates before you leave.",
  },
] satisfies {
  body: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  id: string;
  title: string;
}[];

export const KEYPAD_KEYS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "",
  "0",
  "back",
] as const;

export const HERO_EXPANDED_HEIGHT = 332;
export const HERO_COLLAPSED_HEIGHT = 110;
export const HERO_COLLAPSE_DISTANCE =
  HERO_EXPANDED_HEIGHT - HERO_COLLAPSED_HEIGHT;

export const absoluteFill = {
  bottom: 0,
  left: 0,
  position: "absolute" as const,
  right: 0,
  top: 0,
};

export const floatingShadow = {
  elevation: 12,
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 16 },
  shadowOpacity: 0.14,
  shadowRadius: 22,
};

export const softPillShadow = {
  elevation: 6,
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.1,
  shadowRadius: 14,
};

export const TicketFlowContext =
  createContext<TicketFlowContextValue | null>(null);

export function useTicketFlowData() {
  const context = useContext(TicketFlowContext);

  if (!context) {
    throw new Error("Ticket flow data is unavailable.");
  }

  return context;
}

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export function buildStaticMapPreviewUrl(
  longitude?: number | null,
  latitude?: number | null,
) {
  if (typeof longitude !== "number" || typeof latitude !== "number") {
    return "https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=1200&height=700&center=lonlat:-73.9934,40.7505&zoom=14&marker=lonlat:-73.9934,40.7505;type:awesome;color:%23ef4444;size:large";
  }

  return `https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=1200&height=700&center=lonlat:${longitude},${latitude}&zoom=14&marker=lonlat:${longitude},${latitude};type:awesome;color:%23ef4444;size:large`;
}

export function buildSeatSummary(seats: Seat[]) {
  if (!seats.length) {
    return "No ticket seats";
  }

  const firstSeat = seats[0];
  const sameRow = seats.every((seat) => seat.row === firstSeat.row);
  const sameSection = seats.every(
    (seat) => seat.section === firstSeat.section,
  );

  if (sameRow && sameSection) {
    return `Sec ${firstSeat.section}, Row ${firstSeat.row}`;
  }

  if (sameSection) {
    return `Sec ${firstSeat.section}`;
  }

  return `${seats.length} Ticket Seats`;
}
