import {
  PRIORITY_LABELS,
  type Task,
  type TaskStatus,
} from "../types";

interface DashboardViewProps {
  tasks: Task[];
  onOpenNewTask: () => void;
  onNavigateToTasks: (priorityFilter?: "high") => void;
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>;
  onSelectTask: (task: Task) => void;
}

export function DashboardView({
  tasks,
  onOpenNewTask,
  onNavigateToTasks,
  onStatusChange,
  onSelectTask,
}: DashboardViewProps) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const todoTasks = safeTasks.filter((t) => t.status === "todo");
  const inProgressTasks = safeTasks.filter((t) => t.status === "in_progress");
  const doneTasks = safeTasks.filter((t) => t.status === "done");
  const highPriorityTasks = safeTasks.filter((t) => t.priority === "high" && t.status !== "done");
  const medPriorityTasks = safeTasks.filter((t) => t.priority === "medium" && t.status !== "done");
  const lowPriorityTasks = safeTasks.filter((t) => t.priority === "low" && t.status !== "done");

  const total = safeTasks.length;
  const completionRate = total > 0 ? Math.round((doneTasks.length / total) * 100) : 0;

  return (
    <div className="pro-dashboard">
      {/* Header Banner */}
      <div className="pro-dashboard-header">
        <div className="header-meta-block">
          <div className="live-sprint-badge">
            <span className="live-pulse-dot" />
            <span>Sprint Cycle 4 Active</span>
          </div>
          <h1 className="pro-dashboard-title">Sprint Command Center</h1>
          <p className="pro-dashboard-subtitle">
            Executive overview of task velocity, delivery pipeline stages, and critical bug tracking.
          </p>
        </div>

        <button
          type="button"
          className="pro-action-btn"
          onClick={onOpenNewTask}
        >
          <span className="action-plus">+</span>
          <span>New Issue</span>
        </button>
      </div>

      {/* 4 Performance Metric Pods */}
      <div className="metric-pods-grid">
        <div className="metric-pod">
          <div className="pod-header">
            <span className="pod-label">Sprint Health</span>
            <span className="pod-badge pod-badge--emerald">On Track</span>
          </div>
          <div className="pod-number-row">
            <span className="pod-value">{completionRate}%</span>
            <span className="pod-subtext">{doneTasks.length} of {total} completed</span>
          </div>
          <div className="pod-progress-track">
            <div className="pod-progress-bar" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        <div className="metric-pod">
          <div className="pod-header">
            <span className="pod-label">In Flight Work</span>
            <span className="pod-badge pod-badge--blue">Active</span>
          </div>
          <div className="pod-number-row">
            <span className="pod-value">{inProgressTasks.length}</span>
            <span className="pod-subtext">{todoTasks.length} waiting in backlog</span>
          </div>
          <div className="pod-footer-meta">
            <span>● Velocity: High</span>
          </div>
        </div>

        <div className="metric-pod">
          <div className="pod-header">
            <span className="pod-label">High Priority Radar</span>
            <span className={`pod-badge ${highPriorityTasks.length > 0 ? "pod-badge--amber" : "pod-badge--slate"}`}>
              {highPriorityTasks.length > 0 ? "Needs Review" : "Clear"}
            </span>
          </div>
          <div className="pod-number-row">
            <span className="pod-value">{highPriorityTasks.length}</span>
            <span className="pod-subtext">Urgent blocking tickets</span>
          </div>
          <div className="pod-footer-meta">
            <button
              type="button"
              className="pod-link"
              onClick={() => onNavigateToTasks("high")}
            >
              Filter urgent items →
            </button>
          </div>
        </div>

        <div className="metric-pod">
          <div className="pod-header">
            <span className="pod-label">Total Backlog</span>
            <span className="pod-badge pod-badge--purple">{total} Total</span>
          </div>
          <div className="pod-number-row">
            <span className="pod-value">{total}</span>
            <span className="pod-subtext">{doneTasks.length} shipped to production</span>
          </div>
          <div className="pod-footer-meta">
            <span>● 100% Traceability</span>
          </div>
        </div>
      </div>

      {/* Visual Workflow Pipeline Board */}
      <div className="pipeline-card">
        <div className="pipeline-card-header">
          <div className="pipeline-title-group">
            <h3 className="pipeline-title">Delivery Pipeline</h3>
            <span className="pipeline-subtitle">Live movement across development phases</span>
          </div>
          <button
            type="button"
            className="pipeline-view-all-btn"
            onClick={() => onNavigateToTasks()}
          >
            Open Full List →
          </button>
        </div>

        <div className="pipeline-columns-grid">
          {/* Backlog Column */}
          <div className="pipeline-column">
            <div className="col-header">
              <span className="col-indicator col-indicator--todo" />
              <h4 className="col-title">To Do</h4>
              <span className="col-count">{todoTasks.length}</span>
            </div>
            <div className="col-cards-wrapper">
              {todoTasks.length === 0 ? (
                <div className="empty-col-message">No pending backlog tasks</div>
              ) : (
                todoTasks.slice(0, 3).map((task) => (
                  <div
                    key={task._id}
                    className="pipeline-task-item"
                    onClick={() => onSelectTask(task)}
                  >
                    <div className="pipeline-task-top">
                      <span className="pipeline-task-id">#T-{task._id.slice(-4).toUpperCase()}</span>
                      <span className={`priority-chip priority-chip--${task.priority}`}>
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                    </div>
                    <p className="pipeline-task-title">{task.title}</p>
                    <div className="pipeline-task-bottom">
                      <span className="pipeline-assignee">{task.assignee || "General Backlog"}</span>
                      <button
                        type="button"
                        className="quick-move-btn"
                        title="Start Task"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(task._id, "in_progress");
                        }}
                      >
                        Start →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="pipeline-column">
            <div className="col-header">
              <span className="col-indicator col-indicator--progress" />
              <h4 className="col-title">In Progress</h4>
              <span className="col-count">{inProgressTasks.length}</span>
            </div>
            <div className="col-cards-wrapper">
              {inProgressTasks.length === 0 ? (
                <div className="empty-col-message">No tasks currently in progress</div>
              ) : (
                inProgressTasks.slice(0, 3).map((task) => (
                  <div
                    key={task._id}
                    className="pipeline-task-item pipeline-task-item--active"
                    onClick={() => onSelectTask(task)}
                  >
                    <div className="pipeline-task-top">
                      <span className="pipeline-task-id">#T-{task._id.slice(-4).toUpperCase()}</span>
                      <span className={`priority-chip priority-chip--${task.priority}`}>
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                    </div>
                    <p className="pipeline-task-title">{task.title}</p>
                    <div className="pipeline-task-bottom">
                      <span className="pipeline-assignee">{task.assignee || "Assigned"}</span>
                      <button
                        type="button"
                        className="quick-move-btn quick-move-btn--done"
                        title="Mark Completed"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(task._id, "done");
                        }}
                      >
                        Done ✓
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Completed Column */}
          <div className="pipeline-column">
            <div className="col-header">
              <span className="col-indicator col-indicator--done" />
              <h4 className="col-title">Completed</h4>
              <span className="col-count">{doneTasks.length}</span>
            </div>
            <div className="col-cards-wrapper">
              {doneTasks.length === 0 ? (
                <div className="empty-col-message">No items completed yet</div>
              ) : (
                doneTasks.slice(0, 3).map((task) => (
                  <div
                    key={task._id}
                    className="pipeline-task-item pipeline-task-item--done"
                    onClick={() => onSelectTask(task)}
                  >
                    <div className="pipeline-task-top">
                      <span className="pipeline-task-id">#T-{task._id.slice(-4).toUpperCase()}</span>
                      <span className="priority-chip priority-chip--done">Done</span>
                    </div>
                    <p className="pipeline-task-title pipeline-task-title--done">{task.title}</p>
                    <div className="pipeline-task-bottom">
                      <span className="pipeline-assignee">{task.assignee || "Closed"}</span>
                      <span className="done-check-badge">✓</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Insights Row: Urgent Radar & Priority Distribution */}
      <div className="insights-two-col">
        {/* Urgent Radar */}
        <div className="insight-card">
          <div className="insight-header">
            <h3 className="insight-title">Critical Attention Queue</h3>
            <span className="insight-count-pill">{highPriorityTasks.length} Urgent</span>
          </div>

          {highPriorityTasks.length === 0 ? (
            <div className="insight-empty-banner">
              <span className="insight-empty-emoji">🛡️</span>
              <p className="insight-empty-main">All critical items resolved</p>
              <p className="insight-empty-sub">Sprint has no active blocking tickets.</p>
            </div>
          ) : (
            <div className="insight-items-list">
              {highPriorityTasks.map((task) => (
                <div
                  key={task._id}
                  className="urgent-task-card"
                  onClick={() => onSelectTask(task)}
                >
                  <div className="urgent-card-left">
                    <span className="urgent-tag">High</span>
                    <span className="urgent-title-text">{task.title}</span>
                  </div>
                  <div className="urgent-card-right">
                    <button
                      type="button"
                      className="urgent-status-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusChange(task._id, task.status === "todo" ? "in_progress" : "done");
                      }}
                    >
                      {task.status === "todo" ? "Start" : "Complete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Priority Breakdown & Distribution */}
        <div className="insight-card">
          <div className="insight-header">
            <h3 className="insight-title">Priority Breakdown</h3>
            <span className="insight-meta-info">{total} active issues</span>
          </div>

          <div className="capacity-members-list">
            <div className="capacity-row">
              <div className="capacity-member-profile">
                <span className="capacity-avatar" style={{ backgroundColor: "#ef4444" }}>H</span>
                <div className="capacity-name-group">
                  <span className="capacity-name">High Priority</span>
                  <span className="capacity-role">Urgent triage</span>
                </div>
              </div>
              <div className="capacity-meter">
                <div className="meter-track">
                  <div
                    className="meter-fill"
                    style={{
                      width: `${total > 0 ? (highPriorityTasks.length / total) * 100 : 0}%`,
                      backgroundColor: "#ef4444",
                    }}
                  />
                </div>
              </div>
              <div className="capacity-numbers">
                <span className="capacity-task-count">{highPriorityTasks.length}</span>
                <span className="capacity-unit">tasks</span>
              </div>
            </div>

            <div className="capacity-row">
              <div className="capacity-member-profile">
                <span className="capacity-avatar" style={{ backgroundColor: "#f59e0b" }}>M</span>
                <div className="capacity-name-group">
                  <span className="capacity-name">Medium Priority</span>
                  <span className="capacity-role">Standard delivery</span>
                </div>
              </div>
              <div className="capacity-meter">
                <div className="meter-track">
                  <div
                    className="meter-fill"
                    style={{
                      width: `${total > 0 ? (medPriorityTasks.length / total) * 100 : 0}%`,
                      backgroundColor: "#f59e0b",
                    }}
                  />
                </div>
              </div>
              <div className="capacity-numbers">
                <span className="capacity-task-count">{medPriorityTasks.length}</span>
                <span className="capacity-unit">tasks</span>
              </div>
            </div>

            <div className="capacity-row">
              <div className="capacity-member-profile">
                <span className="capacity-avatar" style={{ backgroundColor: "#64748b" }}>L</span>
                <div className="capacity-name-group">
                  <span className="capacity-name">Low Priority</span>
                  <span className="capacity-role">Enhancements</span>
                </div>
              </div>
              <div className="capacity-meter">
                <div className="meter-track">
                  <div
                    className="meter-fill"
                    style={{
                      width: `${total > 0 ? (lowPriorityTasks.length / total) * 100 : 0}%`,
                      backgroundColor: "#64748b",
                    }}
                  />
                </div>
              </div>
              <div className="capacity-numbers">
                <span className="capacity-task-count">{lowPriorityTasks.length}</span>
                <span className="capacity-unit">tasks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
