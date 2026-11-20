import { useCallback, useState } from "react";
import { BrandMark, LogoutIcon } from "./components/icons";
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
  const [searchQuery, setSearchQuery] = useState("");
  const { tasks, counts, loading, error, reload, createTask, updateStatus, deleteTask } =
    useTasks(filters);
  const { toast, notify } = useToast();
  const filtered = Boolean(filters.status || filters.priority || searchQuery);

  const displayedTasks = tasks.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q))
    );
  });

  const completionPercent = counts.all > 0 ? Math.round((counts.done / counts.all) * 100) : 0;

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
      {/* Top Navbar */}
      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-left">
            <BrandMark />
            <div className="brand-group">
              <span className="brand-name">Team tracker</span>
              <span className="brand-divider" aria-hidden="true">/</span>
              <span className="admin-status-badge">
                <span className="status-live-dot" aria-hidden="true" />
                Admin Console
              </span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="user-profile-chip" title={`Authenticated as ${currentUser.name}`}>
              <div className="user-avatar" aria-hidden="true">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "A"}
                <span className="user-online-dot" />
              </div>
              <div className="user-info">
                <span className="user-name">{currentUser.name}</span>
                <span className="user-role">Administrator</span>
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

      {/* Main Dashboard Layout */}
      <main className="layout">
        {/* Executive Header with Progress & Stat Cards */}
        <section className="dashboard-hero">
          <div className="hero-text-block">
            <h1 className="hero-heading">Team Tasks & Bug Tracker</h1>
            <p className="hero-subheading">
              Manage work items, assign status progression, and collaborate in real time.
            </p>
          </div>

          {/* Metric Cards Banner */}
          <div className="metrics-grid">
            <div className="metric-card metric-card--total">
              <span className="metric-label">Total Issues</span>
              <div className="metric-value-row">
                <span className="metric-number">{counts.all}</span>
                <span className="metric-pill">All time</span>
              </div>
            </div>

            <div className="metric-card metric-card--todo">
              <span className="metric-label">To Do</span>
              <div className="metric-value-row">
                <span className="metric-number">{counts.todo}</span>
                <span className="metric-status-dot metric-status-dot--todo" />
              </div>
            </div>

            <div className="metric-card metric-card--progress">
              <span className="metric-label">In Progress</span>
              <div className="metric-value-row">
                <span className="metric-number">{counts.in_progress}</span>
                <span className="metric-status-dot metric-status-dot--progress" />
              </div>
            </div>

            <div className="metric-card metric-card--done">
              <span className="metric-label">Completed</span>
              <div className="metric-value-row">
                <span className="metric-number">{counts.done}</span>
                <span className="metric-status-dot metric-status-dot--done" />
              </div>
              <div className="completion-bar-track" title={`${completionPercent}% completed`}>
                <div
                  className="completion-bar-fill"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Left Column: Create Task Form */}
        <aside className="panel-container panel-container--form">
          <TaskForm onCreate={createTask} />
        </aside>

        {/* Right Column: Task List & Filter Controls */}
        <section className="panel-container panel-container--list" aria-label="Task list">
          <TaskFilters
            value={filters}
            counts={counts}
            showCounts={!error}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onChange={setFilters}
          />
          <TaskList
            tasks={displayedTasks}
            loading={loading}
            error={error}
            filtered={filtered}
            onRetry={reload}
            onClearFilters={() => {
              setFilters({});
              setSearchQuery("");
            }}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        </section>
      </main>

      <Toast toast={toast} />
    </div>
  );
}
