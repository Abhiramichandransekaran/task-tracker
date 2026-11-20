import { useState } from "react";
import { fullDateTime, relativeTime } from "../format";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "../types";
import { PriorityIcon, TrashIcon } from "./icons";

interface TasksViewProps {
  tasks: Task[];
  initialPriorityFilter?: "high";
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSelectTask: (task: Task) => void;
  onOpenNewTask: () => void;
}

export function TasksView({
  tasks,
  initialPriorityFilter,
  onStatusChange,
  onDelete,
  onSelectTask,
  onOpenNewTask,
}: TasksViewProps) {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "">(initialPriorityFilter ?? "");
  const [searchQuery, setSearchQuery] = useState("");

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const counts = {
    all: safeTasks.length,
    todo: safeTasks.filter((t) => t.status === "todo").length,
    in_progress: safeTasks.filter((t) => t.status === "in_progress").length,
    done: safeTasks.filter((t) => t.status === "done").length,
  };

  const filteredTasks = safeTasks.filter((task) => {
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (priorityFilter && task.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchAssignee = task.assignee?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchAssignee) return false;
    }
    return true;
  });

  return (
    <div className="pro-tasks-view">
      {/* Page Header */}
      <div className="pro-tasks-header">
        <div>
          <h1 className="pro-page-title">Issues & Deliverables</h1>
          <p className="pro-page-subtitle">
            Centralized backlog, issue progression stages, and bug resolution tracking.
          </p>
        </div>

        <button
          type="button"
          className="pro-primary-btn"
          onClick={onOpenNewTask}
        >
          <span className="plus-symbol">+</span> Create Issue
        </button>
      </div>

      {/* Toolbar: Search, Status tabs & Filters */}
      <div className="clean-tasks-toolbar">
        <div className="clean-search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="clean-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search issues, keywords, or assigned engineers..."
          />
          {searchQuery && (
            <button
              type="button"
              className="clean-search-clear"
              onClick={() => setSearchQuery("")}
            >
              ✕
            </button>
          )}
        </div>

        <div className="clean-toolbar-filters">
          <div className="clean-status-tabs" role="tablist">
            {(["all", "todo", "in_progress", "done"] as const).map((key) => {
              const isActive = statusFilter === key;
              const label = key === "all" ? "All Issues" : STATUS_LABELS[key];
              return (
                <button
                  key={key}
                  type="button"
                  className={`clean-status-tab ${isActive ? "clean-status-tab--active" : ""}`}
                  onClick={() => setStatusFilter(key)}
                >
                  <span>{label}</span>
                  <span className="clean-tab-count">{counts[key]}</span>
                </button>
              );
            })}
          </div>

          <select
            className="clean-filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "")}
          >
            <option value="">All Priorities</option>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]} Priority
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Issues List Container */}
      <div className="clean-tasks-list-container">
        {filteredTasks.length === 0 ? (
          <div className="clean-list-empty">
            <p className="empty-title">No issues match current filter</p>
            <p className="empty-subtitle">
              {searchQuery || priorityFilter || statusFilter !== "all"
                ? "Try adjusting search criteria or selecting 'All Issues'."
                : "Your workspace backlog is clear! Click '+ Create Issue' to log a new task."}
            </p>
          </div>
        ) : (
          <div className="clean-tasks-list">
            {filteredTasks.map((task) => {
              const shortId = `#T-${task._id.slice(-4).toUpperCase()}`;

              return (
                <div
                  key={task._id}
                  className="clean-task-row"
                  onClick={() => onSelectTask(task)}
                >
                  <div className="clean-task-row-left">
                    <span className="clean-task-id">{shortId}</span>
                    <div className="clean-task-title-group">
                      <h4 className="clean-task-row-title">{task.title}</h4>
                      {task.description && (
                        <p className="clean-task-row-desc">{task.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="clean-task-row-right" onClick={(e) => e.stopPropagation()}>
                    {/* Assignee Pill */}
                    {task.assignee && (
                      <div className="clean-task-assignee">
                        <span className="member-avatar-chip member-avatar-chip--sm member-avatar-chip--gray">
                          {task.assignee.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="assignee-text">{task.assignee}</span>
                      </div>
                    )}

                    {/* Priority Badge */}
                    <span className={`clean-priority-tag clean-priority-tag--${task.priority}`}>
                      <PriorityIcon priority={task.priority} />
                      {PRIORITY_LABELS[task.priority]}
                    </span>

                    {/* Status Pill Select */}
                    <div className={`clean-status-pill clean-status-pill--${task.status}`}>
                      <span className="status-dot-indicator" />
                      <select
                        className="clean-status-select"
                        value={task.status}
                        onChange={(e) => onStatusChange(task._id, e.target.value as TaskStatus)}
                      >
                        {TASK_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Timestamp */}
                    <span className="clean-task-date" title={fullDateTime(task.createdAt)}>
                      {relativeTime(task.createdAt)}
                    </span>

                    {/* Delete Action */}
                    <button
                      type="button"
                      className="clean-row-delete-btn"
                      title="Delete issue"
                      onClick={() => onDelete(task._id)}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
