import { useId, useState, type FormEvent } from "react";
import { ApiError, errorMessage } from "../api";
import {
  PRIORITY_LABELS,
  TASK_PRIORITIES,
  isTaskPriority,
  type CreateTaskPayload,
  type Task,
  type TaskPriority,
} from "../types";
import { PlusIcon, PriorityIcon } from "./icons";

interface TaskFormProps {
  onCreate: (payload: CreateTaskPayload) => Promise<Task>;
}

type FormField = "title" | "description" | "priority";
type FieldErrors = Partial<Record<FormField, string>>;

const DESCRIPTION_MAX = 500;

export function TaskForm({ onCreate }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const id = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setFormError(null);
    setConfirmation(null);

    try {
      const task = await onCreate({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
      });
      setTitle("");
      setDescription("");
      setPriority("medium");
      setConfirmation(`Added “${task.title}”.`);
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors.length > 0) {
        const next: FieldErrors = {};
        for (const { field, message } of err.fieldErrors) {
          if (field === "title" || field === "description" || field === "priority")
            next[field] ??= message;
        }
        setFieldErrors(next);
        if (Object.keys(next).length === 0) setFormError(err.message);
      } else {
        setFormError(errorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  }

  const describedBy = (field: FormField, extra?: string) =>
    [fieldErrors[field] ? `${id}-${field}-error` : null, extra].filter(Boolean).join(" ") ||
    undefined;

  return (
    <form className="task-form-card" onSubmit={handleSubmit} noValidate aria-labelledby={`${id}-heading`}>
      <div className="task-form-header">
        <div className="task-form-icon-circle" aria-hidden="true">
          <PlusIcon />
        </div>
        <div>
          <h2 id={`${id}-heading`} className="task-form-title">
            New Task or Bug
          </h2>
          <p className="task-form-subtitle">Log an issue for team resolution</p>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor={`${id}-title`} className="form-label">
          Issue Title <span className="required-mark">*</span>
        </label>
        <input
          id={`${id}-title`}
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="e.g. Checkout button unresponsive on Safari"
          aria-invalid={Boolean(fieldErrors.title)}
          aria-describedby={describedBy("title", `${id}-title-hint`)}
        />
        {fieldErrors.title ? (
          <p id={`${id}-title-error`} className="form-field-error">
            {fieldErrors.title}
          </p>
        ) : (
          <p id={`${id}-title-hint`} className="form-field-hint">
            3 to 100 characters
          </p>
        )}
      </div>

      <div className="form-group">
        <div className="form-label-row">
          <label htmlFor={`${id}-description`} className="form-label">
            Description
          </label>
          <span className="optional-tag">optional</span>
        </div>
        <textarea
          id={`${id}-description`}
          className="form-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={DESCRIPTION_MAX}
          rows={4}
          placeholder="Steps to reproduce, expected vs actual result, context…"
          aria-invalid={Boolean(fieldErrors.description)}
          aria-describedby={describedBy("description", `${id}-description-count`)}
        />
        <div className="form-textarea-footer">
          {fieldErrors.description ? (
            <p id={`${id}-description-error`} className="form-field-error">
              {fieldErrors.description}
            </p>
          ) : (
            <span />
          )}
          <span id={`${id}-description-count`} className="char-counter">
            {description.length}/{DESCRIPTION_MAX}
          </span>
        </div>
      </div>

      <fieldset className="form-group priority-fieldset" aria-describedby={describedBy("priority")}>
        <legend className="form-label">Priority Level</legend>
        <div className="priority-cards-grid">
          {TASK_PRIORITIES.map((p) => (
            <label key={p} className={`priority-card priority-card--${p}`}>
              <input
                type="radio"
                name={`${id}-priority`}
                value={p}
                checked={priority === p}
                onChange={(e) => isTaskPriority(e.target.value) && setPriority(e.target.value)}
              />
              <PriorityIcon priority={p} />
              <span className="priority-card-label">{PRIORITY_LABELS[p]}</span>
            </label>
          ))}
        </div>
        {fieldErrors.priority && (
          <p id={`${id}-priority-error`} className="form-field-error">
            {fieldErrors.priority}
          </p>
        )}
      </fieldset>

      {formError && (
        <div className="form-alert-error" role="alert">
          {formError}
        </div>
      )}

      {confirmation && (
        <div className="form-alert-success" role="status">
          ✓ {confirmation}
        </div>
      )}

      <button type="submit" className="submit-task-btn" disabled={submitting}>
        {submitting ? (
          <span className="btn-loading-flex">
            <span className="spinner" aria-hidden="true" />
            Adding issue...
          </span>
        ) : (
          <>
            <PlusIcon />
            <span>Create Issue</span>
          </>
        )}
      </button>
    </form>
  );
}
