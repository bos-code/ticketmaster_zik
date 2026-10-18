import React, { useEffect, useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useImmersiveSafeAreaInsets } from '@/components/immersive/edge-to-edge-hero';
import { LAYER_DRAWER } from '@/constants/layers';
import { useKeyboardLayout, type useKeyboardFrame } from '@/hooks/use-keyboard-height';
import { useOverlaySlot } from '@/lib/overlay-manager';

export function BottomDrawer({ children, className, header, keepTopOnKeyboard = false, minHeight = '75%', onClose, panelStyle, scrollToEndOnKeyboard = false, visible }: {
  children: React.ReactNode;
  className?: string;
  // Fixed above the scrolling content.
  header?: React.ReactNode;
  // Shrink from the bottom when the keyboard opens instead of growing to the top of the screen.
  keepTopOnKeyboard?: boolean;
  minHeight?: number | `${number}%`;
  onClose: () => void;
  panelStyle?: StyleProp<ViewStyle>;
  // When the keyboard opens and the content no longer fits, show its bottom (e.g. the submit button).
  scrollToEndOnKeyboard?: boolean;
  visible: boolean;
}) {
  const insets = useImmersiveSafeAreaInsets();
  const isActive = useOverlaySlot('drawer', visible);
  const { keyboard, windowHeight: height } = useKeyboardLayout();
  const backdropRef = useRef<View>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [backdropBottom, setBackdropBottom] = useState<number | null>(null);
  const liftedBy = getKeyboardOverlap(keyboard, backdropBottom);
  const requestedHeight = typeof minHeight === 'number' ? minHeight : height * parseFloat(minHeight) / 100;
  const closedHeight = Math.min(height - insets.top, Math.max(360, requestedHeight));
  // With the keyboard open the panel never reaches above the visible area.
  const liftedMaxHeight = height - keyboard.offsetTop - liftedBy - insets.top;
  const panelHeight = !liftedBy ? closedHeight : Math.min(liftedMaxHeight, keepTopOnKeyboard ? closedHeight - liftedBy : liftedMaxHeight);
  useEffect(() => {
    if (!scrollToEndOnKeyboard || !keyboard.height) return;
    // Wait a frame for the content to lay out at its new size.
    const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 60);
    return () => clearTimeout(timer);
  }, [keyboard.height, panelHeight, scrollToEndOnKeyboard]);
  return <Modal animationType="slide" statusBarTranslucent transparent visible={isActive} onRequestClose={onClose}>
    <View
      ref={backdropRef}
      onLayout={() => backdropRef.current?.measureInWindow((_x, y, _width, layoutHeight) => setBackdropBottom(y + layoutHeight))}
      style={[styles.backdrop, { paddingBottom: liftedBy, zIndex: LAYER_DRAWER }]}
    >
      <Pressable accessibilityRole="button" accessibilityLabel="Close dialog" style={StyleSheet.absoluteFill} onPress={onClose} />
      <View className={className} style={[styles.panel, { height: panelHeight, paddingBottom: liftedBy ? 0 : insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }, panelStyle]}>
        {header}
        <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
          {children}
        </ScrollView>
      </View>
    </View>
  </Modal>;
}

// How much of the drawer the keyboard would cover. Web reports the overlap directly;
// on native it is the part of the drawer below the keyboard's top edge, which is 0
// when the OS has already resized the window for the keyboard.
function getKeyboardOverlap(keyboard: ReturnType<typeof useKeyboardFrame>, backdropBottom: number | null) {
  if (!keyboard.height) return 0;
  if (Platform.OS === 'web') return keyboard.height;
  if (keyboard.top != null && backdropBottom != null) return Math.max(0, Math.round(backdropBottom - keyboard.top));
  return Platform.OS === 'ios' ? keyboard.height : 0;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  panel: { width: '100%', maxWidth: 680, maxHeight: '95%', alignSelf: 'center', backgroundColor: 'white', shadowColor: '#000000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10 },
});
