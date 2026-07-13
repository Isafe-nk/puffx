import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { APPS, matchApp, type PuffxApp } from '../navigation/apps';

// The OS "kernel" (spec/os-shell.md §4): deliberately tiny. activeApp is DERIVED
// from the URL, never stored — the URL is the source of truth for what's open.
// It holds no window geometry / z-order / open-windows array (that's the
// window-manager half we skip, §9).
interface OSContextValue {
  activeApp: PuffxApp | undefined;
  apps: PuffxApp[];
  openApp: (id: string) => void;
  closeToDesktop: () => void;
}

const OSContext = createContext<OSContextValue | null>(null);

export function OSProvider({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const activeApp = useMemo(() => matchApp(pathname), [pathname]);

  const openApp = useCallback(
    (id: string) => {
      const app = APPS.find((a) => a.id === id);
      if (app && !app.comingSoon) navigate(app.path);
    },
    [navigate]
  );

  const closeToDesktop = useCallback(() => navigate('/'), [navigate]);

  const value = useMemo<OSContextValue>(
    () => ({ activeApp, apps: APPS, openApp, closeToDesktop }),
    [activeApp, openApp, closeToDesktop]
  );

  return <OSContext.Provider value={value}>{children}</OSContext.Provider>;
}

export function useApp(): OSContextValue {
  const ctx = useContext(OSContext);
  if (!ctx) throw new Error('useApp must be used within <OSProvider>');
  return ctx;
}
