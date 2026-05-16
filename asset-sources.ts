import type { ImageSourcePropType } from "react-native";

import type { TicketmasterTabIconName } from "./src/components/ticketmaster-tab-icon";

export const ticketmasterTabIconSources: Record<
  TicketmasterTabIconName,
  { active: ImageSourcePropType; inactive: ImageSourcePropType }
> = {
  discover: {
    active: require("./assets/tabicon/discover.png"),
    inactive: require("./assets/tabicon/discover copy.png"),
  },
  "for-you": {
    active: require("./assets/tabicon/for you_.png"),
    inactive: require("./assets/tabicon/for you  copy.png"),
  },
  "my-tickets": {
    active: require("./assets/tabicon/tickets.png"),
    inactive: require("./assets/tabicon/tickets copy.png"),
  },
  sell: {
    active: require("./assets/tabicon/sell.png"),
    inactive: require("./assets/tabicon/sell copy.png"),
  },
  "my-account": {
    active: require("./assets/tabicon/account_.png"),
    inactive: require("./assets/tabicon/account  copy.png"),
  },
};

export const ticketTransferChoiceIconSources = {
  contactsBook: require("./assets/tabicon/contacts-book.png"),
  send: require("./assets/tabicon/send.png"),
} as const;
