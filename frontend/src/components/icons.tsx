import { PRIORITY_LABELS, type TaskPriority } from "../types";

const FILLED_BARS: Record<TaskPriority, number> = { low: 1, medium: 2, high: 3 };

interface PriorityIconProps {
  priority: TaskPriority;
  /** Announce the priority to screen readers. Leave false when a visible label sits next to it. */
  labelled?: boolean;
}

/** Signal-strength bars: one, two or three filled bars for low, medium, high. */
export function PriorityIcon({ priority, labelled = false }: PriorityIconProps) {
  const filled = FILLED_BARS[priority];
  return (
    <svg
      className={`priority-icon priority-icon--${priority}`}
      viewBox="0 0 16 16"
      width="16"
      height="16"
      role={labelled ? "img" : undefined}
      aria-label={labelled ? `${PRIORITY_LABELS[priority]} priority` : undefined}
      aria-hidden={labelled ? undefined : true}
    >
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={1.5 + i * 5}
          y={10 - i * 4}
          width="3"
          height={4.5 + i * 4}
          rx="1"
          className={i < filled ? "bar bar--on" : "bar"}
        />
      ))}
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.75 4.25h10.5M6.25 4.25V2.75h3.5v1.5M4 4.25l.6 8.4a1 1 0 0 0 1 .93h4.8a1 1 0 0 0 1-.93l.6-8.4M6.75 7v4M9.25 7v4" />
    </svg>
  );
}

export function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
      <rect width="32" height="32" rx="8" className="brand-mark-bg" />
      <rect x="7.5" y="18" width="3.5" height="6.5" rx="1.25" className="brand-mark-bar" opacity="0.55" />
      <rect x="14.25" y="13" width="3.5" height="11.5" rx="1.25" className="brand-mark-bar" opacity="0.8" />
      <rect x="21" y="7.5" width="3.5" height="17" rx="1.25" className="brand-mark-bar" />
    </svg>
  );
}

export function UserIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="10" cy="6" r="3.5" />
      <path d="M3.5 17.5c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="9" width="12" height="9" rx="2" />
      <path d="M6.5 9V6.2a3.5 3.5 0 0 1 7 0V9" />
    </svg>
  );
}

export function EyeIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 10s3-5.5 8-5.5 8 5.5 8 5.5-3 5.5-8 5.5-8-5.5-8-5.5z" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  );
}

export function EyeOffIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 3l14 14M9.1 9.1a2.5 2.5 0 0 0 3.3 3.3M7.3 4.8A8.4 8.4 0 0 1 10 4.5c5 0 8 5.5 8 5.5a13.3 13.3 0 0 1-3.2 4.1M5.2 6.3A13.8 13.8 0 0 0 2 10s3 5.5 8 5.5c1.4 0 2.7-.4 3.8-1" />
    </svg>
  );
}

export function LogoutIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7.5 17.5h-3a2 2 0 0 1-2-2V4.5a2 2 0 0 1 2-2h3M13 14.5l4-4.5-4-4.5M17 10H7.5" />
    </svg>
  );
}

export function ShieldIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 2.5l7 3v4.5c0 5-3.3 8-7 9.5-3.7-1.5-7-4.5-7-9.5V5.5l7-3z" />
    </svg>
  );
}

export function KeyIcon() {
  return (
    <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="4.5" />
      <path d="M10.7 10.7L17 17M14 14l1.5 1.5M16 12l1.5 1.5" />
    </svg>
  );
}
