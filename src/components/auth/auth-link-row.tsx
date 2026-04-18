import { Link, type Href } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ticketColors } from '@/constants/ticket-theme';

type AuthLinkRowProps = {
  href: Href;
  label: string;
  linkLabel: string;
};

export function AuthLinkRow({ href, label, linkLabel }: AuthLinkRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Link href={href} style={styles.link}>
        {linkLabel}
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  label: {
    color: ticketColors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  link: {
    color: ticketColors.primaryBright,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
    paddingLeft: 5,
  },
});
