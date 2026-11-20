import { useCallback, useEffect, useState } from "react";
import { BrandMark, LogoutIcon } from "./components/icons";
import { KanbanBoard } from "./components/KanbanBoard";
import { LoginPage } from "./components/LoginPage";
import { TaskFilters } from "./components/TaskFilters";
import { TaskForm } from "./components/TaskForm";
import { TaskList } from "./components/TaskList";
import { TaskModal } from "./components/TaskModal";
import { Toast, useToast } from "./components/Toast";
import { useTasks } from "./hooks/useTasks";
import { launchConfetti } from "./utils/confetti";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type AdminUser,
  type Task,
  type TaskFilters as Filters,
  type TaskPriority,
  type TaskStatus,
} from "./types";

const AUTH_STORAGE_KEY = "team_tracker_admin_user";
const THEME_STORAGE_KEY = "team_tracker_theme";

function Dashboard({
  currentUser,
  onLogout,
  notify,
  theme,
  onToggleTheme,
}: {
  currentUser: AdminUser;
  onLogout: () => void;
  notify: (msg: string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}) {
  const [filters, setFilters] = useState<Filters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const {
    tasks,
    counts,
    loading,
    error,
    reload,
    createTask,
    updateTask,
    updateStatus,
    deleteTask,
  } = useTasks(filters);

  const filtered = Boolean(filters.status || filters.priority || searchQuery);
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeCounts = counts || { all: 0, todo: 0, in_progress: 0, done: 0 };

  const displayedTasks = safeTasks.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      Boolean(t.description && t.description.toLowerCase().includes(q))
    );
  });

  const completionPercent =
    safeCounts.all > 0 ? Math.round((safeCounts.done / safeCounts.all) * 100) : 0;

  const handleStatusChange = useCallback(
    async (id: string, status: TaskStatus) => {
      await updateStatus(id, status);
      if (status === "done") {
        launchConfetti();
        notify("🎉 Milestone reached! Task marked Done");
      } else {
        notify(`Moved to ${STATUS_LABELS[status]}`);
      }
    },
    [updateStatus, notify]
  );

  const handleUpdateTask = useCallback(
    async (
      id: string,
      payload: { title?: string; description?: string; status?: TaskStatus; priority?: TaskPriority }
    ) => {
      await updateTask(id, payload);
      if (payload.status === "done") {
        launchConfetti();
        notify("🎉 Task completed!");
      } else {
        notify("Task updated successfully");
      }
      setSelectedTask(null);
    },
    [updateTask, notify]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteTask(id);
      notify("Task deleted");
      if (selectedTask?._id === id) setSelectedTask(null);
    },
    [deleteTask, notify, selectedTask]
  );

  const handleExportCsv = () => {
    if (safeTasks.length === 0) {
      notify("No tasks available to export");
      return;
    }

    const headers = ["ID", "Title", "Description", "Priority", "Status", "Created At"];
    const rows = safeTasks.map((t) => [
      `"${t._id}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${(t.description || "").replace(/"/g, '""')}"`,
      `"${PRIORITY_LABELS[t.priority]}"`,
      `"${STATUS_LABELS[t.status]}"`,
      `"${t.createdAt}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `task_tracker_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    notify("Exported tasks to CSV successfully!");
  };

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
            {/* Theme Toggle Button */}
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={onToggleTheme}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              aria-label="Toggle color theme"
            >
              {theme === "dark" ? (
                <>
                  <span className="theme-toggle-icon">☀️</span>
                  <span className="theme-toggle-text">Light</span>
                </>
              ) : (
                <>
                  <span className="theme-toggle-icon">🌙</span>
                  <span className="theme-toggle-text">Dark</span>
                </>
              )}
            </button>

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
              onClick={onLogout}
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
              Manage work items, track sprint velocity, and collaborate with your team.
            </p>
          </div>

          {/* Metric Cards Banner */}
          <div className="metrics-grid">
            <div className="metric-card metric-card--total">
              <span className="metric-label">Total Issues</span>
              <div className="metric-value-row">
                <span className="metric-number">{safeCounts.all}</span>
                <span className="metric-pill">All time</span>
              </div>
            </div>

            <div className="metric-card metric-card--todo">
              <span className="metric-label">To Do</span>
              <div className="metric-value-row">
                <span className="metric-number">{safeCounts.todo}</span>
                <span className="metric-status-dot metric-status-dot--todo" />
              </div>
            </div>

            <div className="metric-card metric-card--progress">
              <span className="metric-label">In Progress</span>
              <div className="metric-value-row">
                <span className="metric-number">{safeCounts.in_progress}</span>
                <span className="metric-status-dot metric-status-dot--progress" />
              </div>
            </div>

            <div className="metric-card metric-card--done">
              <span className="metric-label">Completed</span>
              <div className="metric-value-row">
                <span className="metric-number">{safeCounts.done}</span>
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

        {/* Right Column: Task List or Kanban Board */}
        <section className="panel-container panel-container--list" aria-label="Task board">
          <TaskFilters
            value={filters}
            counts={safeCounts}
            showCounts={!error}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onChange={setFilters}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onExportCsv={handleExportCsv}
          />

          {viewMode === "list" ? (
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
              onSelectTask={setSelectedTask}
            />
          ) : (
            <KanbanBoard
              tasks={displayedTasks}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onSelectTask={setSelectedTask}
            />
          )}
        </section>
      </main>

      {/* Task Inspection & Edit Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "dark" || saved === "light") return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const { toast, notify } = useToast();

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

  return (
    <>
      {!currentUser ? (
        <div className="app">
          <LoginPage onSuccess={handleLoginSuccess} />
        </div>
      ) : (
        <Dashboard
          currentUser={currentUser}
          onLogout={handleLogout}
          notify={notify}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
      <Toast toast={toast} />
    </>
  );
}
