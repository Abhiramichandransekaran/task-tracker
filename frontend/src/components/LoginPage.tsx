import { useState, type FormEvent } from "react";
import { BrandMark, EyeIcon, EyeOffIcon, LockIcon, ShieldIcon, UserIcon } from "./icons";
import { loginAdmin } from "../api";
import type { AdminUser } from "../types";

interface LoginPageProps {
  onSuccess: (user: AdminUser, token: string) => void;
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await loginAdmin({ username: username.trim(), password });
      onSuccess(res.user, res.token);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid admin credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-root">
      {/* Ambient background decoration */}
      <div className="login-ambient-glow" aria-hidden="true" />
      <div className="login-grid-pattern" aria-hidden="true" />

      <main className="login-page-container">
        <div className="login-card">
          {/* Brand & Security Badge */}
          <div className="login-header">
            <div className="login-logo-badge">
              <BrandMark />
            </div>
            <div className="login-header-text">
              <h1 className="login-title">Sign in to Team Tracker</h1>
              <p className="login-subtitle">
                Enter your administrator credentials to access the workspace
              </p>
            </div>
            <div className="login-badge-row">
              <span className="login-admin-chip">
                <ShieldIcon /> Administrator Portal
              </span>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="login-error-alert" role="alert">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-9a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="login-field-group">
              <label htmlFor="login-username" className="login-field-label">
                Admin Username or Email
              </label>
              <div className="login-input-wrapper">
                <span className="login-input-icon" aria-hidden="true">
                  <UserIcon />
                </span>
                <input
                  id="login-username"
                  type="text"
                  className="login-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  autoComplete="username"
                  autoFocus
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="login-field-group">
              <div className="login-field-header">
                <label htmlFor="login-password" className="login-field-label">
                  Password
                </label>
              </div>
              <div className="login-input-wrapper">
                <span className="login-input-icon" aria-hidden="true">
                  <LockIcon />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="login-input login-input--password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="login-btn-loading">
                  <span className="login-spinner" aria-hidden="true" />
                  Authenticating...
                </span>
              ) : (
                "Sign In as Admin"
              )}
            </button>
          </form>

          {/* Security Guarantee Footer */}
          <div className="login-security-footer">
            <ShieldIcon />
            <span>Encrypted Admin Session • Strict Workspace Access</span>
          </div>
        </div>
      </main>
    </div>
  );
}
