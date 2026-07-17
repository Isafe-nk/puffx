// System windows (spec §9): pseudo-apps opened from the desktop right-click menu
// — no rail icon, dedupe like apps, centered. Fixed px sizes from PostHog
// (context/App.tsx appSettings). About is resizable; Display/Kbd are fixed.
export interface SysWindow {
  id: string;
  title: string;
  iconImg?: string;
  w: number;
  h: number;
  resizable: boolean;
}

export const SYSTEM: Record<string, SysWindow> = {
  about: { id: 'about', title: 'About Puffx', iconImg: '/icon/logo.png', w: 760, h: 500, resizable: true },
  display: { id: 'display', title: 'Display', w: 600, h: 550, resizable: false },
  kbd: { id: 'kbd', title: 'Keyboard shortcuts', w: 600, h: 625, resizable: false },
};
