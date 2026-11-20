import { useState, type FormEvent } from "react";
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
import { ClockIcon, PriorityIcon, TrashIcon } from "./icons";

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdate: (id: string, payload: { title?: string; description?: string; status?: TaskStatus; priority?: TaskPriority }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TaskModal({ task, onClose, onUpdate, onDelete }: TaskModalProps) {
  if (!task) return null;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onUpdate(task._id, {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard?.writeText(task._id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortId = `#T-${task._id.slice(-4).toUpperCase()}`;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <button
              type="button"
              className="modal-copy-id-btn"
              onClick={handleCopyId}
              title="Click to copy ID"
            >
              {shortId} {copied ? "✓ Copied" : "📋"}
            </button>
            <span className={`priority-tag priority-tag--${priority}`}>
              <PriorityIcon priority={priority} />
              {PRIORITY_LABELS[priority]}
            </span>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="modal-field">
            <label className="modal-label" htmlFor="edit-task-title">
              Issue Title
            </label>
            <input
              id="edit-task-title"
              type="text"
              className="modal-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="modal-field">
            <label className="modal-label" htmlFor="edit-task-desc">
              Description
            </label>
            <textarea
              id="edit-task-desc"
              rows={4}
              className="modal-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add extra context or reproduction steps..."
            />
          </div>

          <div className="modal-grid-row">
            <div className="modal-field">
              <label className="modal-label" htmlFor="edit-task-status">
                Status
              </label>
              <select
                id="edit-task-status"
                className="modal-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-field">
              <label className="modal-label" htmlFor="edit-task-priority">
                Priority
              </label>
              <select
                id="edit-task-priority"
                className="modal-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-timestamps">
            <ClockIcon />
            <span>Created on {fullDateTime(task.createdAt)} ({relativeTime(task.createdAt)})</span>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="modal-delete-btn"
              onClick={async () => {
                if (window.confirm("Are you sure you want to delete this issue?")) {
                  await onDelete(task._id);
                  onClose();
                }
              }}
            >
              <TrashIcon /> Delete Issue
            </button>

            <div className="modal-footer-right">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="modal-save-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
