import { useCallback, useEffect, useRef, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { createTicketTilt, createTiltPermissionManager, type TiltPoint, type TiltStatus } from '@/lib/ticket-tilt';
import type { TicketTilt } from './ticket-tilt-types';

type OrientationConstructor = { requestPermission?: () => Promise<string> };

// Share decisions and pending prompts across ticket viewers and route remounts.
const motionPermission = createTiltPermissionManager({
  getItem: key => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
});

export function useTicketTilt(enabled = true): TicketTilt {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const [status, setStatus] = useState<TiltStatus>('unsupported');
  const controller = useRef<ReturnType<typeof createTicketTilt> | null>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    const orientation = (window as unknown as { DeviceOrientationEvent?: OrientationConstructor }).DeviceOrientationEvent;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const instance = createTicketTilt({
      sensorSupported: Boolean(orientation),
      pointerSupported: window.matchMedia('(hover: hover) and (pointer: fine)').matches,
      secure: window.isSecureContext,
      requestPermission: orientation?.requestPermission ? () => motionPermission.request(() => orientation.requestPermission!()) : undefined,
      permissionDecision: orientation?.requestPermission ? motionPermission.getDecision : undefined,
      subscribe(listener) {
        const handler = (event: DeviceOrientationEvent) => listener({ beta: event.beta, gamma: event.gamma });
        window.addEventListener('deviceorientation', handler, { passive: true });
        return () => window.removeEventListener('deviceorientation', handler);
      },
      screenAngle: () => window.screen.orientation?.angle ?? (window as unknown as { orientation?: number }).orientation ?? 0,
      now: () => performance.now(),
      requestFrame: callback => window.requestAnimationFrame(callback),
      cancelFrame: id => window.cancelAnimationFrame(id),
      setTimer: (callback, delay) => window.setTimeout(callback, delay),
      clearTimer: id => window.clearTimeout(id),
    }, point => { x.value = point.x; y.value = point.y; }, setStatus);
    controller.current = instance;
    const sync = () => {
      instance.setVisible(enabledRef.current && document.visibilityState === 'visible');
      instance.setReducedMotion(reducedMotion.matches);
      instance.startAutomatically();
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    reducedMotion.addEventListener('change', sync);
    return () => {
      document.removeEventListener('visibilitychange', sync);
      reducedMotion.removeEventListener('change', sync);
      instance.dispose();
      controller.current = null;
    };
  }, [x, y]);
  useEffect(() => {
    controller.current?.setVisible(enabled && document.visibilityState === 'visible');
    controller.current?.startAutomatically();
  }, [enabled]);
  const enable = useCallback(() => { void controller.current?.enable(); }, []);
  const disable = useCallback(() => controller.current?.disable(), []);
  const pointer = useCallback((point: TiltPoint) => controller.current?.pointer(point), []);
  return { x, y, status, enable, disable, pointer };
}
