import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { CustomSpinner } from '@/components/tickets/custom-spinner';
import { LAYER_MODAL } from '@/constants/layers';
import { useOverlaySlot } from '@/lib/overlay-manager';

// Measured from the reference recording: a 36 pt spinner whose centre sits
// 13 pt below the bottom edge of the Tickets/Extras underline.
const SPINNER_SIZE = 36;
const SPINNER_CENTER_BELOW_ANCHOR = 13;

/**
 * Light wash shown over the order page while the transfer flow loads. It is a
 * modal so nothing on the page (hero, tabs, dock, headers) can sit above it,
 * and it blocks scrolling and taps underneath until loading finishes.
 */
export function TransferLoadingOverlay({
  anchorRef,
  visible,
}: {
  // The Tickets/Extras tab strip; the spinner is placed just below its underline.
  anchorRef: React.RefObject<View | null>;
  visible: boolean;
}) {
  const isShown = useOverlaySlot('modal', visible);
  const [spinnerTop, setSpinnerTop] = useState<number | null>(null);

  useEffect(() => {
    if (!visible) {
      setSpinnerTop(null);
      return;
    }

    anchorRef.current?.measureInWindow((_x, y, _width, height) => {
      setSpinnerTop(y + height + SPINNER_CENTER_BELOW_ANCHOR - SPINNER_SIZE / 2);
    });
  }, [anchorRef, visible]);

  return (
    <Modal animationType="none" onRequestClose={() => {}} statusBarTranslucent transparent visible={isShown}>
      <View style={styles.wash}>
        {spinnerTop != null ? (
          <View pointerEvents="none" style={[styles.spinnerRow, { top: spinnerTop }]}>
            <CustomSpinner color="#3355D8" size={SPINNER_SIZE} />
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    zIndex: LAYER_MODAL,
  },
  spinnerRow: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
});
