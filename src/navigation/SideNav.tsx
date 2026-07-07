import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, BookOpen, Menu, X } from 'lucide-react';
import { navConfig } from './navConfig';
import { SideNavItem } from './SideNavItem';

const SoonTag = () => (
  <span className="text-[10px] uppercase tracking-wide text-white/40 border border-white/15 rounded px-1.5 py-px font-semibold">
    Soon
  </span>
);

// The rail's inner content — shared between the desktop rail and the mobile drawer.
function NavContent() {
  return (
    <>
      <div className="mb-8">
        <h2 className="font-display text-4xl text-white tracking-tighter font-bold">puffx</h2>
        <div className="w-12 h-0.5 bg-[#D91222] mt-2 rounded-full"></div>
        <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mt-2">Own your numbers</p>
      </div>

      <div className="flex-1 flex flex-col gap-1.5">
        {navConfig.map((item) => (
          <SideNavItem key={item.path} item={item} />
        ))}
      </div>

      {/* Planned features — visibly labeled, kept out of the tab order */}
      <div className="mt-auto flex flex-col gap-2 border-t border-white/15 pt-4">
        <div className="w-full bg-[#D91222]/40 text-white/50 py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider" aria-disabled="true">
          <Download className="w-4 h-4" />
          Export Report
          <SoonTag />
        </div>
        <div className="flex items-center gap-3 px-3 py-2 mt-2 rounded-lg text-white/30 font-medium" aria-disabled="true">
          <BookOpen className="w-4 h-4" />
          <span className="text-xs uppercase font-bold tracking-wider">Documentation</span>
          <span className="ml-auto"><SoonTag /></span>
        </div>
      </div>
    </>
  );
}

export default function SideNav() {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  // Navigating anywhere closes the drawer.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // While open: focus the drawer, trap Tab inside it, close on Escape, lock body scroll.
  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    const focusables = () =>
      Array.from(
        drawer?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []
      );
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const els = focusables();
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      {/* Desktop rail */}
      <nav
        aria-label="Main navigation"
        className="sidenav-dark hidden lg:flex h-screen w-72 fixed left-0 top-0 bg-[#0B3944] border-r border-[#E6E6E6] flex-col py-8 px-6 z-50"
      >
        <NavContent />
      </nav>

      {/* Mobile header bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-14 z-50 bg-[#0B3944] flex items-center justify-between px-4">
        <span className="font-display text-2xl text-white tracking-tighter font-bold">puffx</span>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="sidenav-dark p-2 -mr-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition duration-200"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile drawer + overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden="true" />
          <nav
            ref={drawerRef}
            id="mobile-nav"
            aria-label="Main navigation"
            className="sidenav-dark absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-[#0B3944] flex flex-col py-6 px-6 overflow-y-auto shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close navigation menu"
              className="self-end p-2 -mr-2 -mt-1 mb-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition duration-200"
            >
              <X className="w-5 h-5" />
            </button>
            <NavContent />
          </nav>
        </div>
      )}
    </>
  );
}
