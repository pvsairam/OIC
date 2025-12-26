/* ============================================
   Container Icons
   Clean icons for control flow containers
   ============================================ */

import type { ContainerType } from '../../types';

interface ContainerIconProps {
  type: ContainerType;
  className?: string;
}

export function ContainerIcon({ type, className }: ContainerIconProps) {
  const icons: Record<ContainerType, JSX.Element> = {
    switch: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M6 3v18" />
        <path d="M18 9v12" />
        <path d="M6 9h8a2 2 0 012 2v0a2 2 0 01-2 2H6" />
        <path d="M6 3l4 6-4 6" />
      </svg>
    ),
    route: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 12h16M16 6l6 6-6 6" />
      </svg>
    ),
    otherwise: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9l6 6M15 9l-6 6" />
      </svg>
    ),
    forEach: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M17 3v18" />
        <path d="M7 21V3" />
        <path d="M7 12h10" />
        <path d="M3 7h4M3 17h4" />
        <path d="M17 7h4M17 17h4" />
      </svg>
    ),
    scope: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 3v18" />
      </svg>
    ),
    while: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 6v12M12 6l-4 4M12 6l4 4" />
        <circle cx="12" cy="18" r="3" />
      </svg>
    ),
    parallel: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 8h16M4 16h16" />
        <path d="M4 8v8M20 8v8" />
        <path d="M12 4v16" />
      </svg>
    ),
  };

  return icons[type] || icons.scope;
}
