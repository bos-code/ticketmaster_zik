import { useEffect, useId, useSyncExternalStore } from 'react';

type OverlayKind = 'drawer' | 'modal';

type OverlayState = { drawers: readonly string[]; modals: readonly string[] };

let state: OverlayState = { drawers: [], modals: [] };
const listeners = new Set<() => void>();

function setState(next: OverlayState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function register(kind: OverlayKind, id: string) {
  const key = kind === 'drawer' ? 'drawers' : 'modals';
  if (state[key].includes(id)) return;
  setState({ ...state, [key]: [...state[key], id] });
}

function unregister(kind: OverlayKind, id: string) {
  const key = kind === 'drawer' ? 'drawers' : 'modals';
  if (!state[key].includes(id)) return;
  setState({ ...state, [key]: state[key].filter((item) => item !== id) });
}

/**
 * Tracks an overlay so that only one bottom drawer is shown at a time (the most
 * recently opened one replaces the others, which come back when it closes) and
 * so that drawers are hidden while any modal is open.
 *
 * Returns whether this overlay may currently be rendered.
 */
export function useOverlaySlot(kind: OverlayKind, visible: boolean) {
  const id = useId();
  const snapshot = useSyncExternalStore(subscribe, () => state, () => state);

  useEffect(() => {
    if (!visible) return;
    register(kind, id);
    return () => unregister(kind, id);
  }, [id, kind, visible]);

  if (!visible) return false;
  if (kind === 'modal') return true;
  const topDrawer = snapshot.drawers[snapshot.drawers.length - 1];
  return snapshot.modals.length === 0 && topDrawer === id;
}
