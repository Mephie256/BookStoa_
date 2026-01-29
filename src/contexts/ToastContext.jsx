import { createContext, useContext, useCallback, useMemo, useRef, useState } from 'react';
import Toast from '../components/ui/Toast';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));

    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const show = useCallback(
    ({ title = 'Successfully saved!', message = '', type = 'success', duration = 3000 } = {}) => {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev, { id, title, message, type }]);

      if (duration && duration > 0) {
        const timeoutId = setTimeout(() => {
          removeToast(id);
        }, duration);
        timeoutsRef.current.set(id, timeoutId);
      }

      return id;
    },
    [removeToast],
  );

  const api = useMemo(
    () => ({
      show,
      success: (message, title = 'Successfully saved!', options = {}) =>
        show({ title, message, type: 'success', ...options }),
      error: (message, title = 'Something went wrong', options = {}) =>
        show({ title, message, type: 'error', duration: 5000, ...options }),
      info: (message, title = 'Notice', options = {}) => show({ title, message, type: 'info', ...options }),
      warning: (message, title = 'Warning', options = {}) =>
        show({ title, message, type: 'warning', duration: 5000, ...options }),
      remove: removeToast,
    }),
    [removeToast, show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast
              title={t.title}
              message={t.message}
              type={t.type}
              onClose={() => removeToast(t.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
