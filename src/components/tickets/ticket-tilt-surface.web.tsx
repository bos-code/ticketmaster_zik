import React, { useRef } from 'react';
import type { TicketTiltSurfaceProps } from './ticket-tilt-surface';

export function TicketTiltSurface({ children, height, motion }: TicketTiltSurfaceProps) {
  const keyboardPoint = useRef({ x: 0, y: 0 });
  const preview = motion?.status === 'pointer';
  const needsGesture = motion?.status === 'ready';
  return <div style={{ height, position: 'relative', width: '100%', overflow: 'hidden' }}
    role={needsGesture ? 'button' : preview ? 'group' : undefined} aria-label={needsGesture ? 'Allow ticket motion' : preview ? 'Ticket lighting preview' : undefined}
    aria-description={preview ? 'Move the pointer or use arrow keys to shift the light. Escape resets it.' : undefined}
    tabIndex={preview || needsGesture ? 0 : undefined}
    onClick={needsGesture ? motion?.enable : undefined}
    onKeyDown={event => {
      if (needsGesture && ['Enter', ' '].includes(event.key)) {
        event.preventDefault();
        motion?.enable();
        return;
      }
      if (!preview || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Escape'].includes(event.key)) return;
      event.preventDefault();
      const point = keyboardPoint.current;
      keyboardPoint.current = event.key === 'Escape' ? { x: 0, y: 0 } : {
        x: Math.max(-1, Math.min(1, point.x + (event.key === 'ArrowRight' ? 0.35 : event.key === 'ArrowLeft' ? -0.35 : 0))),
        y: Math.max(-1, Math.min(1, point.y + (event.key === 'ArrowDown' ? 0.35 : event.key === 'ArrowUp' ? -0.35 : 0))),
      };
      motion?.pointer(keyboardPoint.current);
    }}
    onBlur={() => { keyboardPoint.current = { x: 0, y: 0 }; motion?.pointer(keyboardPoint.current); }}
    onPointerMove={event => {
      if (event.pointerType !== 'mouse') return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (bounds.width && bounds.height) motion?.pointer({ x: 2 * (event.clientX - bounds.left) / bounds.width - 1, y: 2 * (event.clientY - bounds.top) / bounds.height - 1 });
    }} onPointerLeave={() => motion?.pointer({ x: 0, y: 0 })}>
    {children}
  </div>;
}
