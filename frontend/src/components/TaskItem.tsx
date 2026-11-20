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
}

export function TaskItem({ task, onStatusChange, onDelete }: TaskItemProps) {
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
      className={`task-card task-card--${task.status} task-card--priority-${task.priority}${
        confirming ? " task-card--confirming" : ""
      }`}
      aria-busy={busy}
      onKeyDown={(e) => confirming && e.key === "Escape" && cancelDelete()}
    >
      <div className="task-card-accent" aria-hidden="true" />

      <div className="task-card-main">
        {/* Top meta row with short ID and priority badge */}
        <div className="task-card-header">
          <span className="task-id-badge">{shortId}</span>
          <span className={`task-priority-badge task-priority-badge--${task.priority}`}>
            <PriorityIcon priority={task.priority} />
            <span>{PRIORITY_LABELS[task.priority]}</span>
          </span>
        </div>

        {/* Title and Description */}
        <h3 className="task-title">{task.title}</h3>
        {task.description && <p className="task-description">{task.description}</p>}

        {/* Footer meta row with time */}
        <div className="task-card-footer">
          <time
            className="task-timestamp"
            dateTime={task.createdAt}
            title={fullDateTime(task.createdAt)}
          >
            <ClockIcon />
            <span>{relativeTime(task.createdAt)}</span>
          </time>
          {error && (
            <p className="task-error-text" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Action controls */}
      <div className="task-card-actions">
        {confirming ? (
          <div
            className="task-confirm-box"
            role="group"
            aria-label={`Confirm deleting ${task.title}`}
          >
            <span className="task-confirm-prompt">Delete issue?</span>
            <div className="task-confirm-buttons">
              <button
                type="button"
                className="btn-cancel"
                onClick={cancelDelete}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                ref={confirmRef}
                type="button"
                className="btn-delete-confirm"
                onClick={() => void run(() => onDelete(task._id))}
                disabled={busy}
              >
                {busy ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        ) : (
          <div className="task-controls">
            <label className="visually-hidden" htmlFor={statusId}>
              Status for {task.title}
            </label>
            <div className={`status-pill-select status-pill-select--${task.status}`}>
              <span className="status-indicator-dot" aria-hidden="true" />
              <select
                id={statusId}
                value={task.status}
                disabled={busy}
                onChange={(e) => {
                  const next = e.target.value;
                  if (isTaskStatus(next)) void run(() => onStatusChange(task._id, next));
                }}
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            <button
              ref={deleteRef}
              type="button"
              className="action-icon-btn action-icon-btn--delete"
              onClick={() => setConfirming(true)}
              disabled={busy}
              aria-label={`Delete ${task.title}`}
              title="Delete issue"
            >
              <TrashIcon />
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
