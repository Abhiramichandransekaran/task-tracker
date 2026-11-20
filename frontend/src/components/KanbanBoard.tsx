import { useState } from "react";
import { fullDateTime, relativeTime } from "../format";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type Task,
  type TaskStatus,
} from "../types";
import { ClockIcon, PriorityIcon, TrashIcon } from "./icons";

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSelectTask?: (task: Task) => void;
}

const COLUMNS: Array<{ status: TaskStatus; label: string; accentClass: string }> = [
  { status: "todo", label: "To Do", accentClass: "kanban-col--todo" },
  { status: "in_progress", label: "In Progress", accentClass: "kanban-col--progress" },
  { status: "done", label: "Completed", accentClass: "kanban-col--done" },
];

export function KanbanBoard({
  tasks,
  onStatusChange,
  onDelete,
  onSelectTask,
}: KanbanBoardProps) {
  const [movingId, setMovingId] = useState<string | null>(null);

  const handleMove = async (id: string, targetStatus: TaskStatus) => {
    setMovingId(id);
    try {
      await onStatusChange(id, targetStatus);
    } finally {
      setMovingId(null);
    }
  };

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === "todo") return "in_progress";
    if (current === "in_progress") return "done";
    return null;
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === "done") return "in_progress";
    if (current === "in_progress") return "todo";
    return null;
  };

  return (
    <div className="kanban-grid" role="region" aria-label="Kanban task board">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);

        return (
          <div key={col.status} className={`kanban-column ${col.accentClass}`}>
            <div className="kanban-column-header">
              <div className="kanban-column-title-group">
                <span className="kanban-status-indicator" aria-hidden="true" />
                <h3 className="kanban-column-title">{col.label}</h3>
                <span className="kanban-count-pill">{columnTasks.length}</span>
              </div>
            </div>

            <div className="kanban-cards-container">
              {columnTasks.length === 0 ? (
                <div className="kanban-empty-card">
                  <span>No items in {col.label.toLowerCase()}</span>
                </div>
              ) : (
                columnTasks.map((task) => {
                  const nextStatus = getNextStatus(task.status);
                  const prevStatus = getPrevStatus(task.status);
                  const shortId = `#T-${task._id.slice(-4).toUpperCase()}`;

                  return (
                    <div
                      key={task._id}
                      className={`kanban-card ${movingId === task._id ? "kanban-card--busy" : ""}`}
                      onClick={() => onSelectTask?.(task)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelectTask?.(task);
                        }
                      }}
                    >
                      <div className="kanban-card-meta">
                        <span className="kanban-card-id">{shortId}</span>
                        <span className={`priority-tag priority-tag--${task.priority}`}>
                          <PriorityIcon priority={task.priority} />
                          {PRIORITY_LABELS[task.priority]}
                        </span>
                      </div>

                      <h4 className="kanban-card-title">{task.title}</h4>

                      {task.description && (
                        <p className="kanban-card-description">{task.description}</p>
                      )}

                      <div className="kanban-card-footer">
                        <span
                          className="kanban-card-time"
                          title={fullDateTime(task.createdAt)}
                        >
                          <ClockIcon /> {relativeTime(task.createdAt)}
                        </span>

                        <div
                          className="kanban-card-actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {prevStatus && (
                            <button
                              type="button"
                              className="kanban-move-btn"
                              title={`Move back to ${STATUS_LABELS[prevStatus]}`}
                              onClick={() => handleMove(task._id, prevStatus)}
                            >
                              ←
                            </button>
                          )}
                          {nextStatus && (
                            <button
                              type="button"
                              className="kanban-move-btn kanban-move-btn--primary"
                              title={`Move to ${STATUS_LABELS[nextStatus]}`}
                              onClick={() => handleMove(task._id, nextStatus)}
                            >
                              →
                            </button>
                          )}
                          <button
                            type="button"
                            className="kanban-del-btn"
                            title="Delete task"
                            onClick={() => onDelete(task._id)}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
