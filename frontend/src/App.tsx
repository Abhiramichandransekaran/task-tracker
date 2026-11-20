import { useCallback, useEffect, useState } from "react";
import { DashboardView } from "./components/DashboardView";
import { LoginPage } from "./components/LoginPage";
import { NewTaskModal } from "./components/NewTaskModal";
import { Sidebar } from "./components/Sidebar";
import { TaskModal } from "./components/TaskModal";
import { TasksView } from "./components/TasksView";
import { Toast, useToast } from "./components/Toast";
import { useTasks } from "./hooks/useTasks";
import {
  STATUS_LABELS,
  type AdminUser,
  type CreateTaskPayload,
  type Task,
  type TaskFilters as Filters,
  type TaskPriority,
  type TaskStatus,
} from "./types";

const AUTH_STORAGE_KEY = "team_tracker_admin_user";
const THEME_STORAGE_KEY = "team_tracker_theme";

function AuthenticatedWorkspace({
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
  const [currentTab, setCurrentTab] = useState<"dashboard" | "tasks">("dashboard");
  const [priorityFilterForTasks, setPriorityFilterForTasks] = useState<"high" | undefined>(undefined);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [filters] = useState<Filters>({});
  const { tasks, createTask, updateTask, updateStatus, deleteTask } = useTasks(filters);
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const handleCreateTask = async (payload: CreateTaskPayload) => {
    await createTask(payload);
    notify("Issue logged successfully");
  };

  const handleStatusChange = useCallback(
    async (id: string, status: TaskStatus) => {
      await updateStatus(id, status);
      notify(`Status moved to ${STATUS_LABELS[status]}`);
    },
    [updateStatus, notify]
  );

  const handleUpdateTask = useCallback(
    async (
      id: string,
      payload: { title?: string; description?: string; status?: TaskStatus; priority?: TaskPriority }
    ) => {
      await updateTask(id, payload);
      notify("Issue details updated");
      setSelectedTask(null);
    },
    [updateTask, notify]
  );

  const handleDeleteTask = useCallback(
    async (id: string) => {
      await deleteTask(id);
      notify("Issue removed");
      if (selectedTask?._id === id) setSelectedTask(null);
    },
    [deleteTask, notify, selectedTask]
  );

  const handleNavigateToTasks = (filter?: "high") => {
    setPriorityFilterForTasks(filter);
    setCurrentTab("tasks");
  };

  const breadcrumbLabels: Record<typeof currentTab, string> = {
    dashboard: "Command Center",
    tasks: "Issues & Backlog",
  };

  return (
    <div className="workspace-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setPriorityFilterForTasks(undefined);
          setCurrentTab(tab);
        }}
        taskCount={safeTasks.length}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="workspace-main">
        {/* Top Header */}
        <header className="workspace-topbar">
          <div className="topbar-breadcrumb">
            <span className="breadcrumb-root">Workspace</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{breadcrumbLabels[currentTab]}</span>
          </div>

          <div className="topbar-actions">
            <div className="topbar-search" onClick={() => setCurrentTab("tasks")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <span className="search-placeholder">Quick search (tasks, keywords)...</span>
              <kbd className="search-kbd">⌘K</kbd>
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              className="topbar-icon-btn"
              onClick={onToggleTheme}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        {/* View Router */}
        <main className="workspace-page-container">
          {currentTab === "dashboard" && (
            <DashboardView
              tasks={safeTasks}
              onOpenNewTask={() => setIsNewTaskOpen(true)}
              onNavigateToTasks={handleNavigateToTasks}
              onStatusChange={handleStatusChange}
              onSelectTask={setSelectedTask}
            />
          )}

          {currentTab === "tasks" && (
            <TasksView
              tasks={safeTasks}
              initialPriorityFilter={priorityFilterForTasks}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteTask}
              onSelectTask={setSelectedTask}
              onOpenNewTask={() => setIsNewTaskOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Create Issue Modal */}
      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        onCreate={handleCreateTask}
      />

      {/* Task Inspection & Edit Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
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
        <AuthenticatedWorkspace
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
