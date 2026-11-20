import { useEffect, useRef, useState } from "react";
import { errorMessage } from "../api";
import { fullDateTime, relativeTime } from "../format";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_STATUSES,
  isTaskStatus,
  type Task,
  type TaskStatus,
} from "../types";
import { ClockIcon, PriorityIcon, TrashIcon } from "./icons";

interface TaskItemProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSelectTask?: (task: Task) => void;
}

export function TaskItem({ task, onStatusChange, onDelete, onSelectTask }: TaskItemProps) {
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const deleteRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
  }, [confirming]);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function cancelDelete() {
    setConfirming(false);
    deleteRef.current?.focus();
  }

  const statusId = `status-${task._id}`;
  const shortId = `#T-${task._id.slice(-4).toUpperCase()}`;

  return (
    <li
      className={`task task--${task.priority} ${busy ? "task--busy" : ""} ${task.status === "done" ? "task--done" : ""}`}
      aria-busy={busy}
      onClick={() => onSelectTask?.(task)}
      style={{ cursor: "pointer" }}
    >
      <div className="task-content">
        {/* Header Bar with ID, Priority and Time */}
        <div className="task-header-row">
          <div className="task-meta-left">
            <span className="task-short-id" title={task._id}>{shortId}</span>
            <span className={`priority-tag priority-tag--${task.priority}`}>
              <PriorityIcon priority={task.priority} />
              {PRIORITY_LABELS[task.priority]}
            </span>
          </div>

          <div className="task-status-control" onClick={(e) => e.stopPropagation()}>
            <label htmlFor={statusId} className="visually-hidden">
              Status for {task.title}
            </label>
            <div className={`status-pill status-pill--${task.status}`}>
              <span className="status-pill-indicator" aria-hidden="true" />
              <select
                id={statusId}
                className="status-pill-select"
                value={task.status}
                disabled={busy}
                onChange={(e) => {
                  const next = e.target.value;
                  if (isTaskStatus(next)) {
                    run(() => onStatusChange(task._id, next));
                  }
                }}
              >
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            {confirming ? (
              <div
                className="delete-confirm"
                role="group"
                aria-label={`Confirm delete for ${task.title}`}
              >
                <button
                  ref={confirmRef}
                  type="button"
                  className="button button--danger button--micro"
                  disabled={busy}
                  onClick={() => run(() => onDelete(task._id))}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="button button--subtle button--micro"
                  disabled={busy}
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                ref={deleteRef}
                type="button"
                className="task-delete-icon-btn"
                disabled={busy}
                onClick={() => setConfirming(true)}
                aria-label={`Delete task ${task.title}`}
                title="Delete issue"
              >
                <TrashIcon />
              </button>
            )}
          </div>
        </div>

        {/* Title and Description */}
        <div className="task-body">
          <h3 className="task-title">{task.title}</h3>
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}
        </div>

        {/* Footer info row */}
        <div className="task-footer-row">
          <span className="task-timestamp" title={fullDateTime(task.createdAt)}>
            <ClockIcon /> {relativeTime(task.createdAt)}
          </span>
          <span className="task-click-hint">Click to inspect ↗</span>
        </div>

        {error && (
          <p className="task-inline-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </li>
  );
}
