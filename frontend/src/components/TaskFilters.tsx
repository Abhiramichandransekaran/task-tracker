import type { StatusCounts } from "../hooks/useTasks";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  isTaskPriority,
  type TaskFilters as Filters,
  type TaskStatus,
} from "../types";

interface TaskFiltersProps {
  value: Filters;
  counts: StatusCounts;
  showCounts: boolean;
  onChange: (next: Filters) => void;
}

const STATUS_TABS: Array<{ key: TaskStatus | "all"; label: string }> = [
  { key: "all", label: "All" },
  ...TASK_STATUSES.map((s) => ({ key: s, label: STATUS_LABELS[s] })),
];

export function TaskFilters({ value, counts, showCounts, onChange }: TaskFiltersProps) {
  return (
    <div className="toolbar">
      <div className="status-tabs" role="group" aria-label="Filter by status">
        {STATUS_TABS.map(({ key, label }) => {
          const selected = (value.status ?? "all") === key;
          return (
            <button
              key={key}
              type="button"
              className={`status-tab status-tab--${key}`}
              aria-pressed={selected}
              onClick={() => onChange({ ...value, status: key === "all" ? undefined : key })}
            >
              {key !== "all" && <span className="status-dot" aria-hidden="true" />}
              {label}
              {showCounts && <span className="status-tab-count">{counts[key]}</span>}
            </button>
          );
        })}
      </div>

      <label className="priority-filter">
        <span className="priority-filter-label">Priority</span>
        <select
          value={value.priority ?? ""}
          onChange={(e) =>
            onChange({ ...value, priority: isTaskPriority(e.target.value) ? e.target.value : undefined })
          }
        >
          <option value="">Any</option>
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
