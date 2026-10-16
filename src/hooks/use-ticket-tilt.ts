import { useSharedValue } from 'react-native-reanimated';
import type { TicketTilt } from './ticket-tilt-types';

// Web motion is an optional enhancement; native screens keep neutral lighting.
export function useTicketTilt(_enabled = true): TicketTilt {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  return { x, y, status: 'unsupported', enable() {}, disable() {}, pointer() {} };
}
