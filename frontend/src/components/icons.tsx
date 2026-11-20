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
