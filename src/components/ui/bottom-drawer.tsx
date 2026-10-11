import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useImmersiveSafeAreaInsets } from '@/components/immersive/edge-to-edge-hero';

export function BottomDrawer({ children, className, minHeight = '75%', onClose, visible }: {
  children: React.ReactNode;
  className?: string;
  minHeight?: number | `${number}%`;
  onClose: () => void;
  visible: boolean;
}) {
  const { height } = useWindowDimensions();
  const insets = useImmersiveSafeAreaInsets();
  const requestedHeight = typeof minHeight === 'number' ? minHeight : height * parseFloat(minHeight) / 100;
  return <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close dialog" style={StyleSheet.absoluteFill} onPress={onClose} />
      <View className={className} style={[styles.panel, { height: Math.min(height - insets.top, Math.max(360, requestedHeight)), paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }]}>
        <ScrollView keyboardShouldPersistTaps="handled" style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
          {children}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}
const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  panel: { width: '100%', maxWidth: 680, maxHeight: '95%', alignSelf: 'center', backgroundColor: 'white', shadowColor: '#000000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10 },
});
