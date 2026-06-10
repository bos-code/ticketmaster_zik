import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Head from "expo-router/head";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import { ScreenWrapper } from "@/components/ui/screen-wrapper";
import { DEFAULT_TRANSFER_SENDER_NAME } from "@/constants/admin-settings";
import { useAppStore } from "@/store/use-app-store";

const emailFont = Platform.select({
  ios: "SF Pro Display",
  android: "sans-serif",
  web: "SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  default: undefined,
});

const fontStyle = { fontFamily: emailFont } as const;

export default function HelpCenterScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const mockupWidth = Math.min(width, 738);
  const scale = mockupWidth / 738;
  const styles = createStyles(scale, mockupWidth);
  const senderName = useAppStore(
    (state) =>
      state.transferSenderName.trim() || DEFAULT_TRANSFER_SENDER_NAME,
  );

  return (
    <ScreenWrapper backgroundColor="#FFFFFF" style={styles.screen}>
      <Head>
        <title>Help Center</title>
        <meta name="theme-color" content="#FFFFFF" />
      </Head>
      <StatusBar backgroundColor="#FFFFFF" style="dark" />

      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSafeArea} />

        <View style={styles.mailChrome}>
          <View style={styles.mailNav}>
            <TouchableOpacity
              accessibilityLabel="Back to inbox"
              accessibilityRole="button"
              activeOpacity={0.7}
              onPress={() => router.back()}
              style={styles.inboxButton}
            >
              <ChevronLeft styles={styles} />
              <Text style={[styles.inboxText, fontStyle]}>Inbox</Text>
            </TouchableOpacity>
            <View style={styles.navChevrons}>
              <ChevronUp styles={styles} />
              <ChevronDown styles={styles} />
            </View>
          </View>

          <View style={styles.recipientPreview}>
            <View style={styles.avatar} />
            <Text style={[styles.recipientText, fontStyle]} numberOfLines={1}>
              To: joephony@rohanmood ,
            </Text>
          </View>

          <View style={styles.subjectDivider} />
          <Text style={[styles.subject, fontStyle]}>
            {senderName} sent you ticket(s) for
          </Text>
        </View>

        <View style={styles.brandStrip}>
          <Text style={[styles.brandText, fontStyle]}>ticketmaster</Text>
        </View>

        <View style={styles.emailContent}>
          <Text style={[styles.headline, fontStyle]}>
            Your Ticket Transfer From {senderName} Is Ready{"\n"}To Be
            Accepted!
          </Text>

          <View style={styles.progressWrap}>
            <View style={styles.progressLine} />
            <Step
              active
              iconName="move-to-inbox"
              label="Received"
              styles={styles}
            />
            <Step iconName="check" label="Accepted" styles={styles} />
            <Step iconName="outlined-flag" label="Complete" styles={styles} />
          </View>

          <View style={styles.emailCard}>
            <View style={styles.placeholderArea}>
              <Text style={[styles.placeholderText, fontStyle]}>@</Text>
              <Text style={[styles.placeholderText, fontStyle]}>, ,</Text>
            </View>
            <View style={styles.cardDivider} />
            <View style={styles.buttonArea}>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.86}
                style={styles.acceptButton}
              >
                <Text style={[styles.acceptButtonText, fontStyle]}>
                  ACCEPT TICKETS
                </Text>
              </TouchableOpacity>

              <Text style={[styles.terms, fontStyle]}>
                By clicking {'"'}ACCEPT TICKETS{'"'}, you agree to our{" "}
                <Text style={styles.termsLink}>Terms of Use</Text> and any
                applicable ticket back terms.
              </Text>

              <Text style={[styles.warning, fontStyle]}>
                <Text style={styles.warningStrong}>
                  Ticket Tip: Only accept ticket transfers from people you know
                  and trust.
                </Text>{" "}
                This helps everyone to stay both safe and socially distanced
                while also improving ticket security. Please note that due to
                evolving COVID-19 protocols, the venue may change seating
                configurations and we can{"'"}t guarantee social distancing at
                the event.
              </Text>

              <Text style={[styles.warning, fontStyle]}>
                If the tickets were obtained fraudulently by the person
                transferring them, they may be canceled at any time, removed
                from your account and no longer available for use.
              </Text>

              <Text style={[styles.footerStart, fontStyle]}>
                This email is <Text style={styles.footerStrong}>NOT</Text> your
                ticket. You can see the ticket in your Ticketmaster
              </Text>
              <Text style={[styles.footerCopy, fontStyle]}>
                account after accepting the transfer. Once accepted, the tickets
                will be available in your account for entry at the event.
              </Text>
              <View style={styles.footerRule} />
              <Text style={[styles.footerFinePrint, fontStyle]}>
                Please do not reply to this email. For questions about your
                transfer, visit your account or contact support.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

function Step({
  active = false,
  iconName,
  label,
  styles,
}: {
  active?: boolean;
  iconName: React.ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.step}>
      <View style={[styles.stepCircle, active && styles.stepCircleActive]}>
        <MaterialIcons
          color={active ? "#FFFFFF" : inactiveStepGrey}
          name={iconName}
          size={active ? styles.stepIconSizeActive : styles.stepIconSize}
        />
      </View>
      <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

function ChevronLeft({ styles }: { styles: ReturnType<typeof createStyles> }) {
  return <View style={[styles.chevron, styles.chevronLeft]} />;
}

function ChevronUp({ styles }: { styles: ReturnType<typeof createStyles> }) {
  return <View style={[styles.chevron, styles.chevronUp]} />;
}

function ChevronDown({ styles }: { styles: ReturnType<typeof createStyles> }) {
  return <View style={[styles.chevron, styles.chevronDown]} />;
}

const blue = "#0AA4D8";
const navBlue = "#0A84FF";
const progressBlue = "#0097D4";
const inactiveStepGrey = "#9AA4AD";

function createStyles(scale: number, mockupWidth: number) {
  const s = (value: number) => value * scale;

  return {
    stepIconSize: s(29),
    stepIconSizeActive: s(31),
    ...StyleSheet.create({
  screen: {
    paddingTop: 0,
  },
  scrollContent: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    minHeight: "100%",
  },
  mailChrome: {
    backgroundColor: "#1B1B1D",
    width: mockupWidth,
  },
  topSafeArea: {
    backgroundColor: "#F7F7F7",
    height: s(98),
    width: mockupWidth,
  },
  mailNav: {
    alignItems: "center",
    backgroundColor: "#252527",
    borderBottomColor: "#343437",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    height: s(88),
    justifyContent: "space-between",
    paddingHorizontal: s(18),
  },
  inboxButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: s(13),
    height: s(58),
  },
  inboxText: {
    color: navBlue,
    fontSize: s(31),
    fontWeight: "400",
    letterSpacing: 0,
  },
  navChevrons: {
    alignItems: "center",
    flexDirection: "row",
    gap: s(43),
    paddingRight: s(19),
  },
  chevron: {
    borderColor: navBlue,
    borderLeftWidth: s(4),
    borderTopWidth: s(4),
    height: s(28),
    width: s(28),
  },
  chevronLeft: {
    transform: [{ rotate: "-45deg" }],
  },
  chevronUp: {
    transform: [{ rotate: "45deg" }],
  },
  chevronDown: {
    transform: [{ rotate: "-135deg" }],
  },
  recipientPreview: {
    alignItems: "center",
    flexDirection: "row",
    height: s(44),
    marginLeft: s(48),
    marginRight: s(48),
    marginTop: s(-12),
    opacity: 0.72,
    overflow: "hidden",
  },
  avatar: {
    backgroundColor: "#B7BAC6",
    borderRadius: s(22),
    height: s(44),
    marginRight: s(19),
    width: s(44),
  },
  recipientText: {
    color: "#A3A4A9",
    flex: 1,
    fontSize: s(24),
    letterSpacing: 0,
  },
  subjectDivider: {
    backgroundColor: "#2C2C2F",
    height: StyleSheet.hairlineWidth,
    marginHorizontal: s(48),
    marginTop: s(2),
  },
  subject: {
    color: "#FFFFFF",
    fontSize: s(42),
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: s(50),
    paddingBottom: s(28),
    paddingHorizontal: s(49),
    paddingTop: s(23),
  },
  brandStrip: {
    alignItems: "center",
    backgroundColor: blue,
    height: s(114),
    justifyContent: "center",
    width: mockupWidth,
  },
  brandText: {
    color: "#FFFFFF",
    fontSize: s(35),
    fontStyle: "italic",
    fontWeight: "800",
    letterSpacing: 0,
  },
  emailContent: {
    backgroundColor: "#FFFFFF",
    paddingBottom: s(34),
    paddingHorizontal: s(50),
    paddingTop: s(48),
    width: mockupWidth,
  },
  headline: {
    color: "#4B5159",
    fontSize: s(37),
    fontWeight: "400",
    letterSpacing: 0,
    lineHeight: s(52),
    marginBottom: s(44),
    textAlign: "center",
  },
  progressWrap: {
    flexDirection: "row",
    height: s(84),
    justifyContent: "space-between",
    marginBottom: s(41),
    position: "relative",
  },
  progressLine: {
    backgroundColor: "#BBC4CA",
    height: Math.max(StyleSheet.hairlineWidth, s(2)),
    left: s(34),
    position: "absolute",
    right: s(34),
    top: s(24),
  },
  step: {
    alignItems: "center",
    width: s(68),
    zIndex: 1,
  },
  stepCircle: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: inactiveStepGrey,
    borderRadius: s(25),
    borderStyle: "dashed",
    borderWidth: s(2),
    height: s(50),
    justifyContent: "center",
    width: s(50),
  },
  stepCircleActive: {
    backgroundColor: progressBlue,
    borderColor: progressBlue,
    borderStyle: "solid",
    borderWidth: 0,
  },
  stepLabel: {
    color: "#7D858D",
    fontSize: s(16),
    lineHeight: s(20),
    marginTop: s(8),
  },
  stepLabelActive: {
    color: progressBlue,
  },
  emailCard: {
    borderColor: "#D9DEE2",
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
  },
  placeholderArea: {
    backgroundColor: "#FFFFFF",
    minHeight: s(158),
    paddingHorizontal: s(27),
    paddingTop: s(57),
  },
  placeholderText: {
    color: "#6D7580",
    fontSize: s(19),
    lineHeight: s(33),
  },
  cardDivider: {
    backgroundColor: "#D9DEE2",
    height: s(49),
    borderTopColor: "#D9DEE2",
    borderTopWidth: 1,
    borderBottomColor: "#D9DEE2",
    borderBottomWidth: 1,
  },
  buttonArea: {
    paddingHorizontal: s(33),
    paddingTop: s(34),
  },
  acceptButton: {
    alignItems: "center",
    backgroundColor: blue,
    height: s(59),
    justifyContent: "center",
    marginBottom: s(33),
    width: "100%",
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontSize: s(22),
    fontWeight: "800",
    letterSpacing: 0,
  },
  terms: {
    color: "#6B727B",
    fontSize: s(17),
    lineHeight: s(25),
    marginBottom: s(32),
  },
  termsLink: {
    color: "#048EB7",
  },
  warning: {
    color: "#6B727B",
    fontSize: s(17),
    lineHeight: s(24),
    marginBottom: s(26),
  },
  warningStrong: {
    fontWeight: "800",
    letterSpacing: s(1.2),
  },
  footerStart: {
    color: "#6B727B",
    fontSize: s(17),
    lineHeight: s(25),
    marginTop: s(9),
  },
  footerCopy: {
    color: "#6B727B",
    fontSize: s(17),
    lineHeight: s(25),
    marginTop: s(5),
  },
  footerRule: {
    backgroundColor: "#E0E4E8",
    height: StyleSheet.hairlineWidth,
    marginTop: s(28),
    marginBottom: s(18),
  },
  footerFinePrint: {
    color: "#8B929B",
    fontSize: s(14),
    lineHeight: s(20),
    paddingBottom: s(36),
  },
  footerStrong: {
    fontWeight: "800",
  },
    }),
  };
}
