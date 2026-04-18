import React, { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ticketColors, ticketRadii, ticketSpacing } from '@/constants/ticket-theme';

type AuthScreenProps = {
  children: ReactNode;
  eyebrow?: string;
  footer?: ReactNode;
  subtitle?: string;
  title: string;
};

export function AuthScreen({ children, eyebrow, footer, subtitle, title }: AuthScreenProps) {
  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', default: undefined })}
        style={styles.keyboard}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Text style={styles.brandText}>T</Text>
            </View>
            <Text style={styles.brandName}>Ticketmaster Zik</Text>
          </View>

          <View style={styles.header}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>

          <View style={styles.body}>{children}</View>

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ticketColors.background,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: ticketSpacing.lg,
    paddingVertical: ticketSpacing.xl,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: ticketSpacing.sm,
    marginBottom: ticketSpacing.xl,
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: ticketColors.primary,
    borderRadius: ticketRadii.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  brandName: {
    color: ticketColors.text,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  header: {
    gap: ticketSpacing.sm,
    marginBottom: ticketSpacing.xl,
  },
  eyebrow: {
    color: ticketColors.primaryBright,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  title: {
    color: ticketColors.text,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 42,
  },
  subtitle: {
    color: ticketColors.textMuted,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 24,
  },
  body: {
    gap: ticketSpacing.lg,
  },
  footer: {
    marginTop: ticketSpacing.xl,
  },
});
