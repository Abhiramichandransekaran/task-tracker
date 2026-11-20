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
      // In case backend is not running or returns 401
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
    <div className="login-wrapper">
      <div className="login-card">
        {/* Header / Brand */}
        <div className="login-brand">
          <BrandMark />
          <div className="login-brand-meta">
            <span className="login-brand-title">Team Tracker</span>
            <span className="login-badge-pill">
              <ShieldIcon /> Admin Portal
            </span>
          </div>
        </div>

        <div className="login-heading">
          <h2>Sign In to Workspace</h2>
          <p>Restricted admin access. Please authenticate to manage team tasks and issues.</p>
        </div>

        {/* Error notification */}
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

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <label htmlFor="login-username">Admin Username or Email</label>
            <div className="input-with-icon">
              <span className="input-icon" aria-hidden="true">
                <UserIcon />
              </span>
              <input
                id="login-username"
                type="text"
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

          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <div className="input-with-icon">
              <span className="input-icon" aria-hidden="true">
                <LockIcon />
              </span>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle-btn"
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
              <span className="btn-loading-flex">
                <span className="spinner" aria-hidden="true" />
                Signing in...
              </span>
            ) : (
              "Sign In as Admin"
            )}
          </button>
        </form>

        <div className="login-footer">
          <span>Protected workspace • Strictly for authenticated administrators</span>
        </div>
      </div>
    </div>
  );
}
