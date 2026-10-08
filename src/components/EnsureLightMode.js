'use client';

import { useEffect } from 'react';

/**
 * Ensures that the landing page and marketing routes are strictly rendered in light mode.
 * Dark mode is reserved exclusively for pad workspaces.
 */
export default function EnsureLightMode() {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return null;
}
