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

export type ExtraCard = {
  body: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  id: string;
  title: string;
};
