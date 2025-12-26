/* ============================================
   Activity Icons
   Clean, professional line icons
   Oracle-style visual language
   ============================================ */

import type { ActivityType } from '../../types';

interface ActivityIconProps {
  type: ActivityType;
  className?: string;
}

export function ActivityIcon({ type, className }: ActivityIconProps) {
  const icons: Record<ActivityType, JSX.Element> = {
    map: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 6h7M4 12h5M4 18h7" />
        <path d="M14 6h6M14 12h6M14 18h6" />
        <path d="M11 6l3 6M8 12l6 6" />
      </svg>
    ),
    invoke: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M9 12h6M15 12l-3-3M15 12l-3 3" />
        <rect x="3" y="6" width="18" height="12" rx="2" />
      </svg>
    ),
    stageFile: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M12 18v-6M9 15l3 3 3-3" />
      </svg>
    ),
    assign: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M8 12h8" />
        <path d="M12 8v8" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
    lookup: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
        <path d="M8 8h6M8 11h4" />
      </svg>
    ),
    notification: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
    start: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="9" />
        <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
      </svg>
    ),
    end: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="9" />
        <rect x="9" y="9" width="6" height="6" fill="currentColor" stroke="none" />
      </svg>
    ),
    callback: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 12h6M10 12l-3-3M10 12l-3 3" />
        <path d="M14 12h6M14 12l3-3M14 12l3 3" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
    wait: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    throw: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 9v4M12 17h.01" />
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
    javascript: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M8 17V11M8 17c0 1 .5 2 2 2s2-1 2-2" />
        <path d="M16 11c-1.5 0-2 .5-2 1.5s.5 1.5 2 2 2 1 2 2-.5 1.5-2 1.5" />
      </svg>
    ),
    logger: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 6h16M4 10h16M4 14h10M4 18h6" />
      </svg>
    ),
  };

  return icons[type] || icons.invoke;
}
