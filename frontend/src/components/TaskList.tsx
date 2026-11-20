import type { Task, TaskStatus } from "../types";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filtered: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSelectTask?: (task: Task) => void;
}

export function TaskList({
  tasks,
  loading,
  error,
  filtered,
  onRetry,
  onClearFilters,
  onStatusChange,
  onDelete,
  onSelectTask,
}: TaskListProps) {
  if (error) {
    return (
      <div className="list-state list-state--error" role="alert">
        <p className="list-state-title">Couldn't load tasks</p>
        <p>{error}</p>
        <button type="button" className="button" onClick={onRetry}>Try again</button>
      </div>
    );
  }

  if (loading && tasks.length === 0) {
    return (
      <ul className="task-list" aria-busy="true" aria-label="Loading tasks">
        {[0, 1, 2].map((i) => (
          <li key={i} className="task task--skeleton">
            <span className="skeleton skeleton--icon" />
            <div className="task-body">
              <span className="skeleton skeleton--title" />
              <span className="skeleton skeleton--line" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="list-state" role="status">
        <p className="list-state-title">
          {filtered ? "No issues match your current filters" : "No issues logged yet"}
        </p>
        <p className="list-state-body">
          {filtered
            ? "Try loosening your search term or status selection."
            : "Use the form on the left to log the team's first task."}
        </p>
        {filtered && (
          <button type="button" className="button button--subtle" onClick={onClearFilters}>
            Reset all filters
          </button>
        )}
      </div>
    );
  }

  return (
    <ul className="task-list" aria-label="Tasks">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          onSelectTask={onSelectTask}
        />
      ))}
    </ul>
  );
}
