'use client';

import { useEffect, useState } from 'react';
import { SessionUser, getCurrentUser, subscribe } from './demo-store';

/**
 * Subscribe a component to the demo store. The selector is re-evaluated on
 * every render after mount, and the component force-renders whenever the
 * store fires a notification (createDonation, sendMessage, …).
 *
 * Why not useSyncExternalStore? Our derived selectors return freshly built
 * arrays/objects (filters, aggregations) so React's reference-equality guard
 * would throw "result of getSnapshot should be cached". This pattern dodges
 * that requirement entirely.
 *
 * The `fallback` is rendered on the server and during the very first client
 * render so SSR/CSR markup matches; the real selector takes over after mount.
 */
export function useDemoStore<T>(selector: () => T, fallback: T): T {
  const [mounted, setMounted] = useState(false);
  const [, forceRender] = useState(0);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = subscribe(() => forceRender((n) => n + 1));
    return unsubscribe;
  }, []);

  if (!mounted) return fallback;
  return selector();
}

/**
 * Returns the currently logged in demo user, or null if signed out.
 * Hydrates after mount so SSR matches.
 */
export function useCurrentUser(): { user: SessionUser | null; ready: boolean } {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    setReady(true);
    const unsubscribe = subscribe(() => {
      setUser(getCurrentUser());
    });
    return unsubscribe;
  }, []);

  return { user, ready };
}

/**
 * Forces a stable initial render to avoid hydration mismatches when the
 * component depends on browser-only state (localStorage, time, etc.).
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
