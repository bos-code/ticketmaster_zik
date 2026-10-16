import React, { type ReactNode } from 'react';
import { View } from 'react-native';
import type { TicketTilt } from '@/hooks/ticket-tilt-types';

export type TicketTiltSurfaceProps = { children: ReactNode; height?: number; motion?: TicketTilt };
export function TicketTiltSurface({ children, height }: TicketTiltSurfaceProps) {
  return <View style={{ height, position: 'relative', overflow: 'hidden' }}>{children}</View>;
}
