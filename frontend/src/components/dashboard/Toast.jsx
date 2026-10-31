import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';

const noop = () => {};

// Contexte : n'importe quel composant du dashboard peut faire `const toast = useToast()`
export const ToastContext = createContext({ success: noop, error: noop, info: noop, dismiss: noop });
export const useToast = () => useContext(ToastContext);

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (type, message, duration) => {
      const id = ++idRef.current;
      setToasts((t) => [...t.slice(-3), { id, type, message }]);
      if (duration > 0) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const toast = useMemo(
    () => ({
      success: (m, d = 3500) => push('success', m, d),
      error: (m, d = 6000) => push('error', m, d),
      info: (m, d = 5000) => push('info', m, d),
      dismiss,
    }),
    [push, dismiss]
  );

  return { toasts, toast };
}

const STYLES = {
  success: { icon: FiCheckCircle, box: 'bg-[#1f3a2c]/95 border-green-400/40', iconColor: 'text-green-400' },
  error: { icon: FiAlertTriangle, box: 'bg-[#3d2328]/95 border-red-400/40', iconColor: 'text-red-400' },
  info: { icon: FiInfo, box: 'bg-[#2A2A3C]/95 border-gold/40', iconColor: 'text-gold' },
};

export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div
      className="fixed top-4 right-4 z-[200] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const s = STYLES[t.type] || STYLES.info;
        const Icon = s.icon;
        return (
          <div
            key={t.id}
            role={t.type === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex items-start gap-3 border rounded-lg px-4 py-3 shadow-xl animate-fade-in ${s.box}`}
          >
            <Icon size={18} className={`mt-0.5 shrink-0 ${s.iconColor}`} />
            <p className="flex-1 text-sm text-cream break-words">{t.message}</p>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-muted hover:text-cream shrink-0"
              aria-label="Fermer"
            >
              <FiX size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
