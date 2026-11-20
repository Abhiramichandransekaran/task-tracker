import { useCallback, useState } from "react";
import { BrandMark, LogoutIcon, ShieldIcon } from "./components/icons";
import { LoginPage } from "./components/LoginPage";
import { TaskFilters } from "./components/TaskFilters";
import { TaskForm } from "./components/TaskForm";
import { TaskList } from "./components/TaskList";
import { Toast, useToast } from "./components/Toast";
import { useTasks } from "./hooks/useTasks";
import {
  STATUS_LABELS,
  type AdminUser,
  type TaskFilters as Filters,
  type TaskStatus,
} from "./types";

const AUTH_STORAGE_KEY = "team_tracker_admin_user";

export default function App() {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [filters, setFilters] = useState<Filters>({});
  const { tasks, counts, loading, error, reload, createTask, updateStatus, deleteTask } =
    useTasks(filters);
  const { toast, notify } = useToast();
  const filtered = Boolean(filters.status || filters.priority);

  const handleLoginSuccess = useCallback(
    (user: AdminUser) => {
      setCurrentUser(user);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } catch {
        // LocalStorage fallback
      }
      notify(`Welcome back, ${user.name}!`);
    },
    [notify]
  );

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
    notify("Signed out successfully.");
  }, [notify]);

  const handleStatusChange = useCallback(
    async (id: string, status: TaskStatus) => {
      await updateStatus(id, status);
      notify(`Moved to ${STATUS_LABELS[status]}`);
    },
    [updateStatus, notify]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteTask(id);
      notify("Task deleted");
    },
    [deleteTask, notify]
  );

  // If user is not authenticated, display the dedicated Admin Login Page
  if (!currentUser) {
    return (
      <div className="app">
        <LoginPage onSuccess={handleLoginSuccess} />
        <Toast toast={toast} />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-left">
            <BrandMark />
            <span className="brand-name">Team tracker</span>
            <span className="topbar-badge">
              <ShieldIcon /> Admin
            </span>
          </div>

          <div className="topbar-right">
            <div className="user-profile-chip" title={`Logged in as ${currentUser.name}`}>
              <div className="user-avatar" aria-hidden="true">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="user-info">
                <span className="user-name">{currentUser.name}</span>
                <span className="user-role">@{currentUser.username}</span>
              </div>
            </div>

            <button
              type="button"
              className="sign-out-btn"
              onClick={handleLogout}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogoutIcon />
              <span className="sign-out-text">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="layout">
        <div className="page-head">
          <h1>Tasks and bugs</h1>
          <p>Log what the team is working on, move it along, and clear out what's done.</p>
        </div>

        <aside className="panel panel--form">
          <TaskForm onCreate={createTask} />
        </aside>

        <section className="panel panel--list" aria-label="Task list">
          <TaskFilters value={filters} counts={counts} showCounts={!error} onChange={setFilters} />
          <TaskList
            tasks={tasks}
            loading={loading}
            error={error}
            filtered={filtered}
            onRetry={reload}
            onClearFilters={() => setFilters({})}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        </section>
      </main>

      <Toast toast={toast} />
    </div>
  );
}
