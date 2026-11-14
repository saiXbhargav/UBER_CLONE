import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

const STYLES = {
  success: { icon: 'ri-checkbox-circle-fill', color: 'text-emerald-400' },
  error: { icon: 'ri-error-warning-fill', color: 'text-red-400' },
  info: { icon: 'ri-information-fill', color: 'text-sky-400' },
};

let nextId = 1;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (type, message) => {
      const id = nextId++;
      setToasts((t) => [...t.slice(-2), { id, type, message }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const toast = useMemo(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-3 z-[2000] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:left-auto lg:right-6 lg:top-auto lg:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            onClick={() => dismiss(t.id)}
            className="pointer-events-auto flex w-full max-w-sm animate-fade-in cursor-pointer items-start gap-3 rounded-xl bg-neutral-900 px-4 py-3 text-sm text-white shadow-xl"
          >
            <i className={`${STYLES[t.type].icon} ${STYLES[t.type].color} text-lg leading-5`} />
            <p className="leading-5">{t.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
