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
      <div className="list-state">
        {filtered ? (
          <>
            <p className="list-state-title">No tasks match these filters</p>
            <p>Try another status or priority, or clear the filters to see everything.</p>
            <button type="button" className="button" onClick={onClearFilters}>Clear filters</button>
          </>
        ) : (
          <>
            <p className="list-state-title">No tasks yet</p>
            <p>Log a bug or task with the form, and it will show up here for the team.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <ul className={`task-list${loading ? " task-list--refreshing" : ""}`} aria-busy={loading}>
      {tasks.map((task) => (
        <TaskItem key={task._id} task={task} onStatusChange={onStatusChange} onDelete={onDelete} />
      ))}
    </ul>
  );
}
