import { useEffect, useRef, useState } from "react";
import { errorMessage } from "../api";
import { fullDateTime, relativeTime } from "../format";
import { PRIORITY_LABELS, STATUS_LABELS, TASK_STATUSES, isTaskStatus, type Task, type TaskStatus } from "../types";
import { PriorityIcon, TrashIcon } from "./icons";

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

  return (
    <li
      className={`task task--${task.status}${confirming ? " task--confirming" : ""}`}
      aria-busy={busy}
      onKeyDown={(e) => confirming && e.key === "Escape" && cancelDelete()}
    >
      <div className="task-priority" title={`${PRIORITY_LABELS[task.priority]} priority`}>
        <PriorityIcon priority={task.priority} />
      </div>

      <div className="task-body">
        <h3 className="task-title">{task.title}</h3>
        {task.description && <p className="task-description">{task.description}</p>}
        <p className="task-meta">
          <span className={`task-meta-priority task-meta-priority--${task.priority}`}>
            {PRIORITY_LABELS[task.priority]} priority
          </span>
          <time dateTime={task.createdAt} title={fullDateTime(task.createdAt)}>
            Added {relativeTime(task.createdAt)}
          </time>
        </p>
        {error && <p className="field-error" role="alert">{error}</p>}
      </div>

      {confirming ? (
        <div className="task-actions task-confirm" role="group" aria-label={`Confirm deleting ${task.title}`}>
          <span className="task-confirm-text">Delete this task?</span>
          <button type="button" className="button button--small" onClick={cancelDelete} disabled={busy}>
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            className="button button--small button--danger-solid"
            onClick={() => void run(() => onDelete(task._id))}
            disabled={busy}
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      ) : (
        <div className="task-actions">
          <label className="visually-hidden" htmlFor={statusId}>
            Status for {task.title}
          </label>
          <span className={`status-pill status-pill--${task.status}`}>
            <span className="status-dot" aria-hidden="true" />
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
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </span>
          <button
            ref={deleteRef}
            type="button"
            className="icon-button icon-button--danger"
            onClick={() => setConfirming(true)}
            disabled={busy}
            aria-label={`Delete ${task.title}`}
            title="Delete task"
          >
            <TrashIcon />
          </button>
        </div>
      )}
    </li>
  );
}
