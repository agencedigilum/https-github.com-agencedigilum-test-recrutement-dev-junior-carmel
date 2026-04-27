import { useEffect, useState } from "react";
import { subscribeToToast, type ToastPayload } from "~/lib/toast";

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastPayload[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToToast((payload) => {
      setToasts((prev) => [...prev, payload]);

      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== payload.id));
      }, 3200);
    });

    return unsubscribe;
  }, []);

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type === "success" ? "toast-success" : "toast-error"}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
