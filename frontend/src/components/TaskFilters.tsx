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
  viewMode: "list" | "kanban";
  onViewModeChange: (mode: "list" | "kanban") => void;
  onExportCsv: () => void;
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
  viewMode,
  onViewModeChange,
  onExportCsv,
}: TaskFiltersProps) {
  return (
    <div className="toolbar-container">
      {/* Search Input Bar with View Switcher & Export */}
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
              ✕
            </button>
          )}
        </div>

        <div className="toolbar-actions-group">
          {/* View Mode Toggle */}
          <div className="view-mode-toggle" role="group" aria-label="View layout toggle">
            <button
              type="button"
              className={`view-mode-btn ${viewMode === "list" ? "view-mode-btn--active" : ""}`}
              onClick={() => onViewModeChange("list")}
              title="List View"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 3.5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1zm0 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1zm0 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1z" />
              </svg>
              <span>List</span>
            </button>
            <button
              type="button"
              className={`view-mode-btn ${viewMode === "kanban" ? "view-mode-btn--active" : ""}`}
              onClick={() => onViewModeChange("kanban")}
              title="Kanban Board View"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-11zm5 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-7zm5 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-9z" />
              </svg>
              <span>Kanban</span>
            </button>
          </div>

          {/* Export to CSV Button */}
          <button
            type="button"
            className="export-csv-btn"
            onClick={onExportCsv}
            title="Export all tasks to CSV"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 10v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3M8 2v8M5 7l3 3 3-3" />
            </svg>
            <span>Export CSV</span>
          </button>

          {/* Priority Filter */}
          <div className="filter-select-wrapper">
            <select
              id="filter-priority"
              className="filter-select"
              value={value.priority ?? ""}
              onChange={(e) => {
                const nextPriority = e.target.value;
                onChange({
                  ...value,
                  priority: isTaskPriority(nextPriority) ? nextPriority : undefined,
                });
              }}
              aria-label="Filter by priority"
            >
              <option value="">All Priorities</option>
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Status Segmented Tabs (Visible in List View) */}
      {viewMode === "list" && (
        <div className="status-tabs-row" role="tablist" aria-label="Filter by status">
          {STATUS_TABS.map((tab) => {
            const isActive = tab.key === "all" ? !value.status : value.status === tab.key;
            const count = showCounts ? counts[tab.key] : null;

            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`status-tab ${isActive ? "status-tab--active" : ""}`}
                onClick={() =>
                  onChange({
                    ...value,
                    status: tab.key === "all" ? undefined : tab.key,
                  })
                }
              >
                {tab.key !== "all" && (
                  <span
                    className={`status-tab-dot status-tab-dot--${tab.key}`}
                    aria-hidden="true"
                  />
                )}
                <span className="status-tab-label">{tab.label}</span>
                {count !== null && <span className="status-tab-badge">{count}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
