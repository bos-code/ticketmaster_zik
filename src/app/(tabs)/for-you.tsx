import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '@/components/ui/screen-wrapper';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';

export default function ForYouScreen() {
  return (
    <ScreenWrapper backgroundColor="#EAEBEE">
      <Head>
        <meta name="theme-color" content="#EAEBEE" />
        <meta name="color-scheme" content="light" />
      </Head>
      <StatusBar backgroundColor="#EAEBEE" style="dark" />
      <View style={styles.content}>
        
        {/* The White Circle Illustration */}
        <View style={styles.circleContainer}>
          <Svg width="180" height="180" viewBox="0 0 160 160">
            {/* Action Marks */}
            <Rect x="86" y="44" width="7" height="18" fill="#026CDF" transform="rotate(35 86 44)" rx="1.5" />
            <Rect x="108" y="52" width="7" height="13" fill="#026CDF" transform="rotate(75 108 52)" rx="1.5" />

            {/* Left black dash */}
            <Rect x="20" y="65" width="22" height="7" fill="#000000" rx="1" />
            
            {/* Right blue dash */}
            <Rect x="122" y="98" width="16" height="7" fill="#026CDF" rx="1" />

            {/* --- BLUE PERSON --- */}
            {/* Extrusion (Dark Navy) */}
            <Circle cx="56" cy="67" r="16" fill="#09142E" />
            <Path d="M41,87 L67,87 L75,121 L23,121 Z" fill="#09142E" strokeLinejoin="round" />
            {/* Front (Blue) */}
            <Circle cx="60" cy="65" r="16" fill="#026CDF" />
            <Path d="M45,85 L71,85 L79,119 L27,119 Z" fill="#026CDF" strokeLinejoin="round" />

            {/* --- BLACK PERSON --- */}
            {/* Extrusion (Blue) */}
            <Circle cx="94" cy="94" r="15" fill="#026CDF" />
            <Path d="M80,111 L104,111 L112,143 L63,143 Z" fill="#026CDF" strokeLinejoin="round" />
            {/* Front (Black) */}
            <Circle cx="98" cy="92" r="15" fill="#000000" />
            <Path d="M84,109 L108,109 L116,141 L67,141 Z" fill="#000000" strokeLinejoin="round" />

          </Svg>
        </View>

        {/* Text content */}
        <Text style={styles.title}>FIND EVENTS FOR YOU</Text>
        <Text style={styles.subtitle}>
          Get a personalised experience based on the artists, teams{'\n'}and performers you love.
        </Text>

        {/* Button */}
        <TouchableOpacity style={styles.button} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAEBEE', // Light gray background matching image
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    marginTop: -80, // shifted slightly up to visually center including tab bar
  },
  circleContainer: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 44,
  },
  title: {
    fontSize: 19,
    fontFamily: 'System',
    fontWeight: '700',
    color: '#111111',
    letterSpacing: 0.3,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14.5,
    color: '#606060', // Gray tone
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 44,
  },
  button: {
    backgroundColor: '#026CDF', // Ticketmaster blue
    width: '100%',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
