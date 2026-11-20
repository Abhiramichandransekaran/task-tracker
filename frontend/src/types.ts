// Shared API & Workspace types.

export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export const TASK_PRIORITIES = ["low", "medium", "high"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Completed",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: string;
  department: string;
  status: "Active" | "Busy" | "Away";
  color: string;
  joinedDate: string;
}

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "mem-1",
    name: "Pugal",
    initials: "PU",
    email: "pugal@tasktracker.com",
    role: "Senior Fullstack Engineer",
    department: "Core Platform",
    status: "Active",
    color: "#b45309",
    joinedDate: "Jan 2026",
  },
  {
    id: "mem-2",
    name: "Abhi",
    initials: "AB",
    email: "abhi@tasktracker.com",
    role: "Frontend Architect",
    department: "UI & Experience",
    status: "Busy",
    color: "#2563eb",
    joinedDate: "Mar 2026",
  },
  {
    id: "mem-3",
    name: "System Admin",
    initials: "SA",
    email: "admin@tasktracker.com",
    role: "DevOps & Security Lead",
    department: "Infrastructure",
    status: "Active",
    color: "#475569",
    joinedDate: "Nov 2025",
  },
  {
    id: "mem-4",
    name: "Mathan",
    initials: "MA",
    email: "mathan@tasktracker.com",
    role: "Quality Assurance Specialist",
    department: "Testing & Release",
    status: "Active",
    color: "#059669",
    joinedDate: "Feb 2026",
  },
];

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  createdAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
}

export type UpdateTaskPayload = Partial<Pick<Task, "title" | "description" | "status" | "priority" | "assignee">>;

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  message: string;
  errors?: FieldError[];
}

export const isTaskStatus = (value: string): value is TaskStatus =>
  (TASK_STATUSES as readonly string[]).includes(value);

export const isTaskPriority = (value: string): value is TaskPriority =>
  (TASK_PRIORITIES as readonly string[]).includes(value);

export interface AdminUser {
  username: string;
  name: string;
  role: string;
  email?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: AdminUser;
}
