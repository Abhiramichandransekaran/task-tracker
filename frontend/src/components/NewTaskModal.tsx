import { useState, type FormEvent } from "react";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type CreateTaskPayload,
  type TaskPriority,
  type TaskStatus,
} from "../types";

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: CreateTaskPayload) => Promise<void>;
}

export function NewTaskModal({ isOpen, onClose, onCreate }: NewTaskModalProps) {
  if (!isOpen) return null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [assignee, setAssignee] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        assignee: assignee.trim() || undefined,
      });
      setTitle("");
      setDescription("");
      setAssignee("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="clean-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="clean-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="clean-modal-header">
          <div>
            <h2 className="clean-modal-title">Create Workspace Issue</h2>
            <p className="clean-modal-subtitle">Log a deliverable or bug ticket for sprint resolution.</p>
          </div>
          <button
            type="button"
            className="clean-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="clean-modal-form">
          {error && <div className="clean-modal-error">{error}</div>}

          <div className="clean-form-group">
            <label className="clean-form-label" htmlFor="new-task-title">
              Issue Title <span className="clean-required">*</span>
            </label>
            <input
              id="new-task-title"
              type="text"
              className="clean-form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement OAuth2 multi-tenant authentication"
              required
              autoFocus
            />
          </div>

          <div className="clean-form-group">
            <label className="clean-form-label" htmlFor="new-task-desc">
              Description & Acceptance Criteria
            </label>
            <textarea
              id="new-task-desc"
              rows={3}
              className="clean-form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Steps to reproduce, technical requirements, or expected outcome..."
            />
          </div>

          <div className="clean-form-grid-3">
            <div className="clean-form-group">
              <label className="clean-form-label" htmlFor="new-task-priority">
                Priority
              </label>
              <select
                id="new-task-priority"
                className="clean-form-select"
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

            <div className="clean-form-group">
              <label className="clean-form-label" htmlFor="new-task-status">
                Workflow Status
              </label>
              <select
                id="new-task-status"
                className="clean-form-select"
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

            <div className="clean-form-group">
              <label className="clean-form-label" htmlFor="new-task-assignee">
                Assignee
              </label>
              <input
                id="new-task-assignee"
                type="text"
                className="clean-form-input"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="e.g. Frontend Team"
              />
            </div>
          </div>

          <div className="clean-modal-footer">
            <button
              type="button"
              className="clean-modal-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="clean-modal-submit-btn"
              disabled={submitting}
            >
              {submitting ? "Publishing..." : "+ Create Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
