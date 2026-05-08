import type { Ionicons } from "@expo/vector-icons";

export type FlowScreen =
  | "list"
  | "select"
  | "recipientChoice"
  | "recipientForm"
  | "viewer";

export type PanelTab = "tickets" | "extras";
export type TransferModal = "none" | "auth" | "loading" | "success" | "error";
export type DeliveryMode = "email" | "mobile";

export type Seat = {
  id: string;
  ticketIndex: number;
  label: string;
  note: string;
  seat: string;
  row: string;
  section: string;
  barcodeValue?: string;
  canTransfer: boolean;
  canSell: boolean;
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
    directionsEventId?: string;
    headerSubtitle: string;
    heroImage: any;
    id: string;
    latitude?: number | null;
    longitude?: number | null;
    mapImageUrl: string;
    shortTitle: string;
    title: string;
    venue: string;
    venueAddress?: string;
    venueSummary?: string;
  };
  order: {
    id: string;
    orderNumber: string;
    ticketCount: number;
    ticketCountLabel: string;
  };
  orderId: string;
  seats: Seat[];
};

export type ExtraCard = {
  body: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  id: string;
  title: string;
};
