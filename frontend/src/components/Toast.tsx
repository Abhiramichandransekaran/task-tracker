import { useCallback, useEffect, useState } from "react";

interface ToastState {
  id: number;
  message: string;
}

const TOAST_MS = 3200;

/** A single, self-dismissing status message. */
export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = useCallback((message: string) => setToast({ id: Date.now(), message }), []);
  return { toast, notify };
}

export function Toast({ toast }: { toast: ToastState | null }) {
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <p key={toast.id} className="toast">
          {toast.message}
        </p>
      )}
    </div>
  );
}
