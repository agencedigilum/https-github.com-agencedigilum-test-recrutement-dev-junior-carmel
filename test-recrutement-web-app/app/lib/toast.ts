export type ToastType = "success" | "error";

export type ToastPayload = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastListener = (payload: ToastPayload) => void;

const listeners = new Set<ToastListener>();
let toastId = 0;

export function subscribeToToast(listener: ToastListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function showToast(type: ToastType, message: string) {
  const payload: ToastPayload = {
    id: ++toastId,
    type,
    message,
  };

  listeners.forEach((listener) => listener(payload));
}
