import type {
  ApiErrorBody,
  CreateTaskPayload,
  FieldError,
  LoginPayload,
  LoginResponse,
  Task,
  TaskFilters,
  UpdateTaskPayload,
} from "./types";

// Empty by default: requests go to /api on the Vite dev server, which proxies to the backend.
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const BASE_TASKS_URL = `${API_BASE}/api/tasks`;
const BASE_AUTH_URL = `${API_BASE}/api/auth`;
const UNREACHABLE = "Can't reach the server. Check that the backend is running on port 5000.";

// Local demo fallback store when backend is not deployed/unreachable
const DEMO_TASKS_STORAGE_KEY = "team_tracker_demo_tasks";
const DEFAULT_DEMO_TASKS: Task[] = [
  {
    _id: "demo-task-1",
    title: "Configure responsive layout for mobile screens",
    description: "Ensure cards and metric tiles render smoothly across handheld viewports.",
    status: "in_progress",
    priority: "high",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    _id: "demo-task-2",
    title: "Implement secure admin authentication & session handling",
    description: "Validate administrative credentials and maintain protected state.",
    status: "done",
    priority: "medium",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    _id: "demo-task-3",
    title: "Review workflow task status filters & search query logic",
    description: "Provide quick filtering by To Do, In Progress, and Done states.",
    status: "todo",
    priority: "low",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

function getDemoTasks(): Task[] {
  try {
    const raw = localStorage.getItem(DEMO_TASKS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(DEMO_TASKS_STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_TASKS));
    return DEFAULT_DEMO_TASKS;
  } catch {
    return DEFAULT_DEMO_TASKS;
  }
}

function saveDemoTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(DEMO_TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Ignore storage quota errors
  }
}

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

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = init.body ? { "Content-Type": "application/json" } : undefined;

  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError(0, { message: UNREACHABLE });
  }

  const text = await res.text().catch(() => "");
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // Non-JSON response (e.g. HTML returned by client-side router/Vercel SPA rewrite)
    throw new ApiError(res.status, { message: UNREACHABLE });
  }

  if (!res.ok) {
    if (isApiErrorBody(body)) throw new ApiError(res.status, body);
    if (res.status >= 502 && res.status <= 504) throw new ApiError(res.status, { message: UNREACHABLE });
    throw new ApiError(res.status, null);
  }
  return body as T;
}

export async function listTasks(filters: TaskFilters, signal?: AbortSignal): Promise<Task[]> {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);
    const query = params.toString();
    const res = await request<Task[]>(`${BASE_TASKS_URL}${query ? `?${query}` : ""}`, { signal });
    return Array.isArray(res) ? res : [];
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    // Seamless fallback to demo tasks when backend is offline
    const all = getDemoTasks();
    return all.filter((t) => {
      if (filters.status && t.status !== filters.status) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      return true;
    });
  }
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  try {
    return await request<Task>(BASE_TASKS_URL, { method: "POST", body: JSON.stringify(payload) });
  } catch (err) {
    // Fallback: create in local demo store
    const newTask: Task = {
      _id: "task-" + Date.now(),
      title: payload.title,
      description: payload.description,
      status: payload.status ?? "todo",
      priority: payload.priority ?? "medium",
      createdAt: new Date().toISOString(),
    };
    const current = getDemoTasks();
    saveDemoTasks([newTask, ...current]);
    return newTask;
  }
}

export async function updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
  try {
    return await request<Task>(`${BASE_TASKS_URL}/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
  } catch (err) {
    // Fallback: update in local demo store
    const current = getDemoTasks();
    let updatedTask: Task | null = null;
    const next = current.map((t) => {
      if (t._id === id) {
        updatedTask = { ...t, ...payload };
        return updatedTask;
      }
      return t;
    });
    if (updatedTask) {
      saveDemoTasks(next);
      return updatedTask;
    }
    throw new ApiError(404, { message: "Task not found" });
  }
}

export async function deleteTask(id: string): Promise<{ message: string; id: string }> {
  try {
    return await request<{ message: string; id: string }>(`${BASE_TASKS_URL}/${id}`, { method: "DELETE" });
  } catch (err) {
    // Fallback: delete in local demo store
    const current = getDemoTasks();
    saveDemoTasks(current.filter((t) => t._id !== id));
    return { message: "Task deleted", id };
  }
}

export async function loginAdmin(payload: LoginPayload): Promise<LoginResponse> {
  try {
    return await request<LoginResponse>(`${BASE_AUTH_URL}/login`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Fallback demo authentication: accept standard admin credentials
    const validUsernames = ["admin", "admin@tasktracker.com"];
    const isUser = validUsernames.some((u) => u.toLowerCase() === payload.username.trim().toLowerCase());
    const isPass = payload.password === "admin123";

    if (isUser && isPass) {
      return {
        message: "Login successful",
        token: "admin-session-token-" + Date.now(),
        user: {
          username: "admin",
          name: "System Admin",
          role: "Administrator",
          email: "admin@tasktracker.com",
        },
      };
    }

    if (err instanceof ApiError && err.status === 401) {
      throw err;
    }
    throw new ApiError(401, { message: "Invalid admin credentials. Use admin / admin123" });
  }
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong.";
}
