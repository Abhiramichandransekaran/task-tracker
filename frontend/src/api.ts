import type {
  ApiErrorBody,
  CreateTaskPayload,
  FieldError,
  Task,
  TaskFilters,
  UpdateTaskPayload,
} from "./types";

// Empty by default: requests go to /api on the Vite dev server, which proxies to the backend.
const BASE_URL = `${import.meta.env.VITE_API_URL ?? ""}/api/tasks`;
const UNREACHABLE = "Can't reach the server. Check that the backend is running on port 5000.";

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: FieldError[];

  constructor(status: number, body: ApiErrorBody | null) {
    super(body?.message ?? `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = body?.errors ?? [];
  }
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === "object" && value !== null && typeof (value as ApiErrorBody).message === "string";
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = init.body ? { "Content-Type": "application/json" } : undefined;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError(0, { message: UNREACHABLE });
  }

  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    if (isApiErrorBody(body)) throw new ApiError(res.status, body);
    // The dev proxy answers 502/503/504 when the backend itself is down.
    if (res.status >= 502 && res.status <= 504) throw new ApiError(res.status, { message: UNREACHABLE });
    throw new ApiError(res.status, null);
  }
  return body as T;
}

export function listTasks(filters: TaskFilters, signal?: AbortSignal): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  const query = params.toString();
  return request<Task[]>(query ? `?${query}` : "", { signal });
}

export function createTask(payload: CreateTaskPayload): Promise<Task> {
  return request<Task>("", { method: "POST", body: JSON.stringify(payload) });
}

export function updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
  return request<Task>(`/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function deleteTask(id: string): Promise<{ message: string; id: string }> {
  return request(`/${id}`, { method: "DELETE" });
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong.";
}
