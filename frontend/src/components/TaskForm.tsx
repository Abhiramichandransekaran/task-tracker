import { useId, useState, type FormEvent } from "react";
import { ApiError, errorMessage } from "../api";
import { PRIORITY_LABELS, TASK_PRIORITIES, isTaskPriority, type CreateTaskPayload, type Task, type TaskPriority } from "../types";
import { PriorityIcon } from "./icons";

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
          if (field === "title" || field === "description" || field === "priority") next[field] ??= message;
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
    [fieldErrors[field] ? `${id}-${field}-error` : null, extra].filter(Boolean).join(" ") || undefined;

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className="panel-title">New task</h2>

      <div className="field">
        <label htmlFor={`${id}-title`}>Title</label>
        <input
          id={`${id}-title`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="e.g. Checkout button unresponsive on Safari"
          aria-invalid={Boolean(fieldErrors.title)}
          aria-describedby={describedBy("title", `${id}-title-hint`)}
        />
        {fieldErrors.title ? (
          <p id={`${id}-title-error`} className="field-error">{fieldErrors.title}</p>
        ) : (
          <p id={`${id}-title-hint`} className="field-hint">3 to 100 characters</p>
        )}
      </div>

      <div className="field">
        <label htmlFor={`${id}-description`}>
          Description <span className="optional">optional</span>
        </label>
        <textarea
          id={`${id}-description`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={DESCRIPTION_MAX}
          rows={4}
          placeholder="Steps to reproduce, expected result, links…"
          aria-invalid={Boolean(fieldErrors.description)}
          aria-describedby={describedBy("description", `${id}-description-count`)}
        />
        {fieldErrors.description && (
          <p id={`${id}-description-error`} className="field-error">{fieldErrors.description}</p>
        )}
        <p id={`${id}-description-count`} className="field-hint field-hint--end">
          {description.length}/{DESCRIPTION_MAX}
        </p>
      </div>

      <fieldset className="field priority-picker" aria-describedby={describedBy("priority")}>
        <legend>Priority</legend>
        <div className="priority-options">
          {TASK_PRIORITIES.map((p) => (
            <label key={p} className={`priority-option priority-option--${p}`}>
              <input
                type="radio"
                name={`${id}-priority`}
                value={p}
                checked={priority === p}
                onChange={(e) => isTaskPriority(e.target.value) && setPriority(e.target.value)}
              />
              <PriorityIcon priority={p} />
              <span>{PRIORITY_LABELS[p]}</span>
            </label>
          ))}
        </div>
        {fieldErrors.priority && (
          <p id={`${id}-priority-error`} className="field-error">{fieldErrors.priority}</p>
        )}
      </fieldset>

      {formError && <p className="form-error" role="alert">{formError}</p>}

      <button type="submit" className="button button--primary" disabled={submitting}>
        {submitting ? "Adding…" : "Add task"}
      </button>
      <p className="form-confirmation" role="status">{confirmation}</p>
    </form>
  );
}
