'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';

export function AppShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Only do this inside the native Capacitor app
    if (!Capacitor.isNativePlatform()) return;

    // --- 1) Intercept window.open ------------------------------------------
    const originalWindowOpen = window.open;

    (window as any).open = (
      url: string | URL,
      target?: string,
      features?: string
    ) => {
      const finalUrl = typeof url === 'string' ? url : url.toString();

      try {
        const u = new URL(finalUrl, window.location.href);
        const isSameOrigin = u.origin === window.location.origin;

        // Same-origin URLs should stay INSIDE the WebView
        if (isSameOrigin) {
          window.location.href = u.toString();
          return null;
        }

        // Different origin (e.g. Stripe checkout) -> let system browser handle it
        return originalWindowOpen
          ? originalWindowOpen(finalUrl, target, features)
          : null;
      } catch {
        // If URL parsing fails, fall back to original behaviour
        return originalWindowOpen
          ? originalWindowOpen(finalUrl as any, target, features)
          : null;
      }
    };

    // --- 2) Rewrite <a target="_blank"> for same-origin links -------------
    const clickHandler = (event: MouseEvent) => {
      const el = (event.target as HTMLElement | null)?.closest(
        'a'
      ) as HTMLAnchorElement | null;

      if (!el) return;

      const href = el.getAttribute('href');
      if (!href) return;

      // Ignore special schemes (tel:, mailto:, etc.)
      if (/^(mailto:|tel:|sms:|geo:)/i.test(href)) return;

      try {
        const url = new URL(href, window.location.href);
        const isSameOrigin = url.origin === window.location.origin;

        if (isSameOrigin && el.target === '_blank') {
          // Same-origin + _blank => keep inside WebView
          event.preventDefault();
          window.location.href = url.toString();
        }
      } catch {
        // ignore parse errors
      }
    };

    document.addEventListener('click', clickHandler);

    // Cleanup on unmount
    return () => {
      document.removeEventListener('click', clickHandler);
      window.open = originalWindowOpen;
    };
  }, []);

  return <>{children}</>;
}