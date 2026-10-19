// Colours for the ticket/transfer bottom drawers. Light values are the
// reference Ticketmaster colours; dark values follow the code drawer's grey
// sheet. Components read them through useDrawerTheme()
// (src/components/ui/drawer-theme.ts), which follows the phone's setting.

export type DrawerScheme = 'light' | 'dark';

export type DrawerColors = {
  // Drawer panel and plain blocks inside it.
  sheet: string;
  // Cards, inputs and outlined buttons sitting on the sheet.
  sheetRaised: string;
  // Footer bar (select seats).
  sheetFooter: string;
  // Pressed outlined button.
  sheetPressed: string;
  divider: string;
  // Headings and values.
  text: string;
  // Large uppercase drawer titles.
  textStrong: string;
  // Seat summary, Transfer Unavailable message.
  textSecondary: string;
  // Small captions under headings (Transfer To screen).
  textCaption: string;
  // Body copy in info drawers.
  textBody: string;
  // "n Selected" counter.
  textHint: string;
  // Small grey labels and the close icon.
  textMuted: string;
  // BACK links and TRANSFER TO.
  link: string;
  linkDisabled: string;
  // Outlined choice buttons and form links.
  action: string;
  actionBorder: string;
  // Close / Get Help labels in info drawers.
  actionStrong: string;
  // Filled black "Transfer Tickets" button.
  button: string;
  onButton: string;
  // Seat cards.
  seatBody: string;
  seatBorder: string;
  checkBorder: string;
  // Recipient form inputs.
  inputBorder: string;
  inputBorderSoft: string;
  placeholder: string;
  error: string;
};

export const drawerPalettes: Record<DrawerScheme, DrawerColors> = {
  light: {
    sheet: '#FFFFFF',
    sheetRaised: '#FFFFFF',
    sheetFooter: '#F9F9F9',
    sheetPressed: '#F9FAFB',
    divider: '#F0F0F0',
    text: '#111111',
    textStrong: '#000000',
    textSecondary: '#444B55',
    textCaption: '#4F5966',
    textBody: '#626262',
    textHint: '#5D6773',
    textMuted: '#70757E',
    link: '#2A84C6',
    linkDisabled: '#A9C9E6',
    action: '#026CDF',
    actionBorder: '#86B7D5',
    actionStrong: '#0452D5',
    button: '#000000',
    onButton: '#FFFFFF',
    seatBody: '#FCF2FC',
    seatBorder: '#D7DCE4',
    checkBorder: '#DBE0E6',
    inputBorder: '#333333',
    inputBorderSoft: '#E0E0E0',
    placeholder: '#999999',
    error: '#FF0000',
  },
  dark: {
    sheet: '#2C2C2C',
    sheetRaised: '#383838',
    sheetFooter: '#242424',
    sheetPressed: '#444444',
    divider: '#3D3D3D',
    text: '#F2F2F2',
    textStrong: '#FFFFFF',
    textSecondary: '#D0D4DA',
    textCaption: '#BCC2CA',
    textBody: '#BDBDBD',
    textHint: '#B3B9C1',
    textMuted: '#A3A8B0',
    link: '#5AA9E6',
    linkDisabled: '#3E5A72',
    action: '#5AA2FF',
    actionBorder: '#3F6E8C',
    actionStrong: '#6F9DF5',
    button: '#FFFFFF',
    onButton: '#000000',
    seatBody: '#3A333C',
    seatBorder: '#4A4A4A',
    checkBorder: '#6A6A6A',
    inputBorder: '#8A8A8A',
    inputBorderSoft: '#555555',
    placeholder: '#8C8C8C',
    error: '#FF6B6B',
  },
};
