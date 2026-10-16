export type TiltPoint = { x: number; y: number };
export type TiltStatus = 'unsupported' | 'ready' | 'requesting' | 'waiting' | 'active' | 'pointer' | 'denied' | 'unavailable' | 'reduced-motion';
export type OrientationSample = { beta: number | null; gamma: number | null };

export type TiltEnvironment = {
  sensorSupported: boolean;
  pointerSupported: boolean;
  secure: boolean;
  requestPermission?: () => Promise<string>;
  subscribe: (listener: (sample: OrientationSample) => void) => () => void;
  screenAngle: () => number;
  now: () => number;
  requestFrame: (callback: () => void) => number;
  cancelFrame: (id: number) => void;
  setTimer: (callback: () => void, delay: number) => number;
  clearTimer: (id: number) => void;
};

const clamp = (value: number) => Math.max(-1, Math.min(1, value));
const angleDelta = (value: number, origin: number) => ((value - origin + 540) % 360) - 180;

export function orientationToTilt(sample: OrientationSample, origin: OrientationSample, screenAngle: number): TiltPoint | null {
  if (![sample.beta, sample.gamma, origin.beta, origin.gamma].every(value => typeof value === 'number' && Number.isFinite(value))) return null;
  const dx = angleDelta(sample.gamma!, origin.gamma!);
  const dy = angleDelta(sample.beta!, origin.beta!);
  const radians = screenAngle * Math.PI / 180;
  return { x: clamp((dx * Math.cos(radians) + dy * Math.sin(radians)) / 25), y: clamp((dy * Math.cos(radians) - dx * Math.sin(radians)) / 25) };
}

// Browser access lives in the hook. This controller owns permissions, calibration,
// smoothing and cleanup, so those paths can be exercised without real sensors.
export function createTicketTilt(environment: TiltEnvironment, onPoint: (point: TiltPoint) => void, onStatus: (status: TiltStatus) => void) {
  let visible = true;
  let reducedMotion = false;
  let disposed = false;
  let consent = false;
  let automaticAttempted = false;
  let generation = 0;
  let status: TiltStatus = 'unsupported';
  let unsubscribe: (() => void) | undefined;
  let timer: number | undefined;
  let frame: number | undefined;
  let origin: OrientationSample | undefined;
  let calibrationAngle = 0;
  let current: TiltPoint = { x: 0, y: 0 };
  let target: TiltPoint = { x: 0, y: 0 };
  let lastTime = 0;

  const setStatus = (next: TiltStatus) => {
    if (!disposed && next !== status) { status = next; onStatus(next); }
  };
  const restingStatus = (): TiltStatus => reducedMotion ? 'reduced-motion' : environment.pointerSupported ? 'pointer' : environment.secure && environment.sensorSupported ? 'ready' : 'unsupported';
  function clearTimer() {
    if (timer !== undefined) environment.clearTimer(timer);
    timer = undefined;
  }
  function reset() {
    if (frame !== undefined) environment.cancelFrame(frame);
    frame = undefined;
    current = target = { x: 0, y: 0 };
    onPoint(current);
  }
  function animate() {
    frame = undefined;
    if (disposed || !visible || reducedMotion) return;
    const now = environment.now();
    const progress = 1 - Math.exp(-Math.min(64, Math.max(1, now - lastTime)) / 95);
    lastTime = now;
    current = { x: current.x + (target.x - current.x) * progress, y: current.y + (target.y - current.y) * progress };
    const settled = Math.abs(target.x - current.x) + Math.abs(target.y - current.y) < 0.002;
    if (settled) current = { ...target };
    onPoint(current);
    if (!settled) frame = environment.requestFrame(animate);
  }
  function move(point: TiltPoint) {
    target = { x: Math.abs(point.x) < 0.02 ? 0 : clamp(point.x), y: Math.abs(point.y) < 0.02 ? 0 : clamp(point.y) };
    if (frame === undefined) { lastTime = environment.now(); frame = environment.requestFrame(animate); }
  }
  function stop() {
    unsubscribe?.();
    unsubscribe = undefined;
    clearTimer();
    origin = undefined;
    reset();
  }
  function start() {
    if (disposed || !visible || reducedMotion || !consent || unsubscribe) return;
    setStatus('waiting');
    unsubscribe = environment.subscribe(sample => {
      if (disposed || !visible || reducedMotion || !consent || !orientationToTilt(sample, sample, 0)) return;
      const angle = environment.screenAngle();
      if (!origin || angle !== calibrationAngle) {
        origin = { ...sample };
        calibrationAngle = angle;
        move({ x: 0, y: 0 });
      }
      clearTimer();
      setStatus('active');
      const point = orientationToTilt(sample, origin, angle);
      if (point) move(point);
    });
    timer = environment.setTimer(() => {
      consent = false;
      stop();
      setStatus('unavailable');
    }, 3000);
  }
  async function enable(automatic = false) {
    if (disposed || !visible || reducedMotion || !environment.secure || !environment.sensorSupported || status === 'requesting' || consent) return;
    const attempt = ++generation;
    setStatus('requesting');
    try {
      // Safari can restore an existing grant on load, but a first-time prompt
      // needs a gesture. Keep the call synchronous when invoked by a tap.
      const permission = environment.requestPermission?.();
      const result = permission ? await permission : 'granted';
      if (disposed || attempt !== generation || !visible || reducedMotion) return;
      if (result !== 'granted') { setStatus('denied'); return; }
      consent = true;
      start();
    } catch {
      if (!disposed && attempt === generation) { stop(); setStatus(automatic ? restingStatus() : 'denied'); }
    }
  }
  setStatus(restingStatus());
  return {
    enable: () => enable(),
    startAutomatically() {
      if (automaticAttempted || disposed || !visible || reducedMotion || environment.pointerSupported || !environment.secure || !environment.sensorSupported) return;
      automaticAttempted = true;
      return enable(true);
    },
    disable() { generation++; consent = false; stop(); setStatus(restingStatus()); },
    pointer(point: TiltPoint) {
      if (!disposed && visible && !reducedMotion && environment.pointerSupported && !consent && Number.isFinite(point.x) && Number.isFinite(point.y)) move(point);
    },
    setVisible(next: boolean) {
      if (visible === next || disposed) return;
      visible = next;
      generation++;
      if (!visible) { stop(); setStatus(restingStatus()); } else if (consent) start(); else setStatus(restingStatus());
    },
    setReducedMotion(next: boolean) {
      if (next === reducedMotion || disposed) return;
      reducedMotion = next;
      generation++;
      if (next) { consent = false; stop(); }
      setStatus(restingStatus());
    },
    dispose() { disposed = true; generation++; consent = false; stop(); },
  };
}
