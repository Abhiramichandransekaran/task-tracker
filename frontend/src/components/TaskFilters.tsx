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
import { SearchIcon } from "./icons";

interface TaskFiltersProps {
  value: Filters;
  counts: StatusCounts;
  showCounts: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onChange: (next: Filters) => void;
}

const STATUS_TABS: Array<{ key: TaskStatus | "all"; label: string }> = [
  { key: "all", label: "All" },
  ...TASK_STATUSES.map((s) => ({ key: s, label: STATUS_LABELS[s] })),
];

export function TaskFilters({
  value,
  counts,
  showCounts,
  searchQuery,
  onSearchChange,
  onChange,
}: TaskFiltersProps) {
  return (
    <div className="toolbar-container">
      {/* Search Input Bar */}
      <div className="toolbar-search-row">
        <div className="search-box-wrapper">
          <span className="search-box-icon" aria-hidden="true">
            <SearchIcon />
          </span>
          <input
            type="text"
            className="search-box-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search issues by title or description…"
            aria-label="Search issues"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <label className="priority-filter">
          <span className="priority-filter-label">Priority</span>
          <select
            value={value.priority ?? ""}
            onChange={(e) =>
              onChange({ ...value, priority: isTaskPriority(e.target.value) ? e.target.value : undefined })
            }
          >
            <option value="">All Priorities</option>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Status Segmented Control */}
      <div className="toolbar-tabs-row">
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

        {(value.status || value.priority || searchQuery) && (
          <button
            type="button"
            className="reset-filters-btn"
            onClick={() => {
              onChange({});
              onSearchChange("");
            }}
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
