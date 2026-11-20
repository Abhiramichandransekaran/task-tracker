import type { AdminUser } from "../types";

interface SidebarProps {
  currentTab: "dashboard" | "tasks";
  onTabChange: (tab: "dashboard" | "tasks") => void;
  taskCount: number;
  currentUser: AdminUser;
  onLogout: () => void;
}

export function Sidebar({
  currentTab,
  onTabChange,
  taskCount,
  currentUser,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-symbol">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div className="brand-text-block">
          <span className="brand-title">TaskPulse</span>
          <span className="brand-subtitle">Team Workspace</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="sidebar-nav">
        <div className="sidebar-group">
          <span className="sidebar-group-label">WORKSPACE</span>

          <button
            type="button"
            className={`sidebar-nav-item ${currentTab === "dashboard" ? "sidebar-nav-item--active" : ""}`}
            onClick={() => onTabChange("dashboard")}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <span className="sidebar-nav-label">Dashboard</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${currentTab === "tasks" ? "sidebar-nav-item--active" : ""}`}
            onClick={() => onTabChange("tasks")}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <path d="m9 14 2 2 4-4" />
            </svg>
            <span className="sidebar-nav-label">Issues & Tasks</span>
            <span className="sidebar-nav-badge">{taskCount}</span>
          </button>
        </div>
      </nav>

      {/* Bottom Footer Info Card */}
      <div className="sidebar-footer">
        <div className="sprint-status-card">
          <div className="sprint-status-dot" />
          <div className="sprint-status-text">
            <span className="sprint-title">Sprint Cycle 4</span>
            <span className="sprint-meta">Active Cycle</span>
          </div>
        </div>

        <div className="sidebar-user-block">
          <div className="user-avatar-initials">
            {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : "AD"}
          </div>
          <div className="user-details">
            <span className="user-display-name">{currentUser.name}</span>
            <span className="user-role-label">{currentUser.role || "Admin"}</span>
          </div>
          <button
            type="button"
            className="user-logout-btn"
            onClick={onLogout}
            title="Sign out"
            aria-label="Sign out"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
