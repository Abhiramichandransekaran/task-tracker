import { useCallback, useState } from "react";
import { BrandMark } from "./components/icons";
import { TaskFilters } from "./components/TaskFilters";
import { TaskForm } from "./components/TaskForm";
import { TaskList } from "./components/TaskList";
import { Toast, useToast } from "./components/Toast";
import { useTasks } from "./hooks/useTasks";
import { STATUS_LABELS, type TaskFilters as Filters, type TaskStatus } from "./types";

export default function App() {
  const [filters, setFilters] = useState<Filters>({});
  const { tasks, counts, loading, error, reload, createTask, updateStatus, deleteTask } = useTasks(filters);
  const { toast, notify } = useToast();
  const filtered = Boolean(filters.status || filters.priority);

  const handleStatusChange = useCallback(
    async (id: string, status: TaskStatus) => {
      await updateStatus(id, status);
      notify(`Moved to ${STATUS_LABELS[status]}`);
    },
    [updateStatus, notify],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteTask(id);
      notify("Task deleted");
    },
    [deleteTask, notify],
  );

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <BrandMark />
          <span className="brand-name">Team tracker</span>
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
