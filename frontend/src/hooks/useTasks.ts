import { useCallback, useEffect, useMemo, useState } from "react";
import * as api from "../api";
import type { CreateTaskPayload, Task, TaskFilters, TaskStatus } from "../types";

export type StatusCounts = Record<TaskStatus | "all", number>;

const matchesFilters = (task: Task, filters: TaskFilters) =>
  (!filters.status || task.status === filters.status) &&
  (!filters.priority || task.priority === filters.priority);

/**
 * Loads tasks for the given server-side filters and exposes mutations that keep the list in sync.
 * `counts` covers every status within the active priority filter, for the status tabs.
 */
export function useTasks(filters: TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [scope, setScope] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const { status, priority } = filters;

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const listRequest = api.listTasks({ status, priority }, controller.signal);
    const scopeRequest = status ? api.listTasks({ priority }, controller.signal) : listRequest;

    Promise.all([listRequest, scopeRequest])
      .then(([list, all]) => {
        setTasks(Array.isArray(list) ? list : []);
        setScope(Array.isArray(all) ? all : []);
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(api.errorMessage(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [status, priority, reloadKey]);

  const counts = useMemo<StatusCounts>(() => {
    const result: StatusCounts = { all: scope.length, todo: 0, in_progress: 0, done: 0 };
    for (const task of scope) result[task.status] += 1;
    return result;
  }, [scope]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const createTask = useCallback(
    async (payload: CreateTaskPayload) => {
      const task = await api.createTask(payload);
      if (!priority || task.priority === priority) setScope((prev) => [task, ...prev]);
      if (matchesFilters(task, { status, priority })) setTasks((prev) => [task, ...prev]);
      return task;
    },
    [status, priority],
  );

  const updateStatus = useCallback(
    async (id: string, nextStatus: TaskStatus) => {
      const updated = await api.updateTask(id, { status: nextStatus });
      setScope((prev) => prev.map((t) => (t._id === id ? updated : t)));
      // Drop the task from view if it no longer matches the active filters.
      setTasks((prev) =>
        prev.flatMap((t) => (t._id !== id ? [t] : matchesFilters(updated, { status, priority }) ? [updated] : [])),
      );
      return updated;
    },
    [status, priority],
  );

  const deleteTask = useCallback(async (id: string) => {
    await api.deleteTask(id);
    setScope((prev) => prev.filter((t) => t._id !== id));
    setTasks((prev) => prev.filter((t) => t._id !== id));
  }, []);

  return { tasks, counts, loading, error, reload, createTask, updateStatus, deleteTask };
}
