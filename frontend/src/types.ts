// Shared API types. These mirror the backend Mongoose model and Zod schemas.

export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export const TASK_PRIORITIES = ["low", "medium", "high"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

/** A task as returned by the API (dates arrive as ISO strings). */
export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
}

/** POST /api/tasks body */
export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

/** PATCH /api/tasks/:id body */
export type UpdateTaskPayload = Partial<Pick<Task, "status" | "priority">>;

/** GET /api/tasks query */
export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface FieldError {
  field: string;
  message: string;
}

/** Error body shape returned by the backend for 4xx/5xx responses. */
export interface ApiErrorBody {
  message: string;
  errors?: FieldError[];
}

export const isTaskStatus = (value: string): value is TaskStatus =>
  (TASK_STATUSES as readonly string[]).includes(value);

export const isTaskPriority = (value: string): value is TaskPriority =>
  (TASK_PRIORITIES as readonly string[]).includes(value);
