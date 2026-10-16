import type { SharedValue } from 'react-native-reanimated';
import type { TiltPoint, TiltStatus } from '@/lib/ticket-tilt';

export type TicketTilt = {
  x: SharedValue<number>;
  y: SharedValue<number>;
  status: TiltStatus;
  enable: () => void;
  disable: () => void;
  pointer: (point: TiltPoint) => void;
};
