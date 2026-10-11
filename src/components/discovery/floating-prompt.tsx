import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Animated, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/app-text';

export function FloatingPrompt({ title, body, icon, color, busy, visible = true, onPress }: {
  title: string; body: string; icon: React.ComponentProps<typeof Ionicons>['name']; color: string; busy?: boolean; visible?: boolean; onPress: () => void;
}) {
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => { if (mounted) setReduceMotion(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { mounted = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    const animation = Animated.timing(progress, { toValue: visible ? 1 : 0, duration: reduceMotion ? 0 : 220, useNativeDriver: Platform.OS !== 'web' });
    animation.start();
    return () => animation.stop();
  }, [visible, reduceMotion, progress]);
  return <View pointerEvents={visible ? 'box-none' : 'none'} accessibilityElementsHidden={!visible} importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'} style={styles.position}><Animated.View style={[styles.animated, { opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }] }]}><Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${body}`} disabled={busy || !visible} onPress={onPress} style={({ pressed }) => [styles.prompt, pressed && { opacity: 0.9 }]}>
    <View style={[styles.icon, { backgroundColor: color }]}>{busy ? <ActivityIndicator color="#111111" /> : <Ionicons name={icon} size={23} color="#111111" />}</View>
    <View style={styles.copy}><Text style={styles.title}>{title}</Text><Text style={styles.body}>{body}</Text></View>
    <Ionicons name="arrow-forward" size={22} color="#111111" />
  </Pressable></Animated.View></View>;
}
const styles = StyleSheet.create({
  position: { position: 'absolute', bottom: 8, left: 16, right: 16, alignItems: 'center' },
  animated: { width: '100%', maxWidth: 560 },
  prompt: { width: '100%', minHeight: 64, backgroundColor: '#FFFFFF', borderRadius: 40, padding: 8, paddingRight: 20, flexDirection: 'row', gap: 10, alignItems: 'center' },
  icon: { width: 41, height: 41, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0 }, title: { color: '#111111', fontSize: 15, fontWeight: '700', lineHeight: 21 }, body: { color: '#111111', fontSize: 14, lineHeight: 19 },
});
