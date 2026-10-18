import { useEffect, useState } from 'react';
import { Keyboard, Platform, useWindowDimensions } from 'react-native';

type KeyboardFrame = {
  height: number;
  // Top edge of the keyboard in window coordinates (native only).
  top: number | null;
  // How far the browser has panned the visible area down (web only).
  offsetTop: number;
};

const CLOSED: KeyboardFrame = { height: 0, top: null, offsetTop: 0 };

export function useKeyboardFrame() {
  const [frame, setFrame] = useState<KeyboardFrame>(CLOSED);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const viewport = typeof window === 'undefined' ? null : window.visualViewport;
      if (!viewport) return;
      const update = () =>
        setFrame({
          height: Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop)),
          top: null,
          offsetTop: Math.max(0, Math.round(viewport.offsetTop)),
        });
      viewport.addEventListener('resize', update);
      viewport.addEventListener('scroll', update);
      update();
      return () => {
        viewport.removeEventListener('resize', update);
        viewport.removeEventListener('scroll', update);
      };
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, (event) =>
      setFrame({ height: event.endCoordinates.height, top: event.endCoordinates.screenY, offsetTop: 0 }),
    );
    const hide = Keyboard.addListener(hideEvent, () => setFrame(CLOSED));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return frame;
}

export function useKeyboardHeight() {
  return useKeyboardFrame().height;
}

/**
 * Keyboard state plus the window height with the keyboard *not* subtracted.
 * On web react-native-web reports the visual viewport, which already excludes
 * the keyboard, so it is added back to get the full layout height.
 */
export function useKeyboardLayout() {
  const keyboard = useKeyboardFrame();
  const { height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  return {
    keyboard,
    windowHeight: isWeb ? height + keyboard.height + keyboard.offsetTop : height,
    // Height left on screen above the keyboard.
    visibleHeight: isWeb ? height : height - keyboard.height,
  };
}
