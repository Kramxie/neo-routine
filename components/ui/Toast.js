'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';

const ToastContext = createContext(null);

function ToastItem({ id, type, message, onDismiss }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  var colors = {
    success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', iconColor: 'text-green-500' },
    error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', iconColor: 'text-red-500' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', iconColor: 'text-amber-500' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', iconColor: 'text-blue-500' },
  };

  var style = colors[type] || colors.info;

  useEffect(function () {
    requestAnimationFrame(function () {
      setIsVisible(true);
    });
  }, []);

  var handleDismiss = useCallback(function () {
    setIsLeaving(true);
    setTimeout(function () { onDismiss(id); }, 300);
  }, [id, onDismiss]);

  var iconPath = '';
  if (type === 'success') iconPath = 'M5 13l4 4L19 7';
  else if (type === 'error') iconPath = 'M6 18L18 6M6 6l12 12';
  else if (type === 'warning') iconPath = 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
  else iconPath = 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';

  var wrapperClass = 'transform transition-all duration-300 ease-out';
  if (isVisible && !isLeaving) {
    wrapperClass += ' translate-x-0 opacity-100';
  } else {
    wrapperClass += ' translate-x-full opacity-0';
  }

  var boxClass = 'flex items-start gap-3 p-4 rounded-xl border shadow-lg min-w-[320px] max-w-md ' + style.bg + ' ' + style.border;

  return (
    <div className={wrapperClass}>
      <div className={boxClass} role="alert">
        <div className="flex-shrink-0 mt-0.5">
          <svg className={'w-5 h-5 ' + style.iconColor} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
          </svg>
        </div>
        <p className={'flex-1 text-sm font-medium ' + style.text}>{message}</p>
        <button
          onClick={handleDismiss}
          className={'flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors ' + style.text}
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-auto">
      {toasts.map(function (t) {
        return (
          <ToastItem
            key={t.id}
            id={t.id}
            type={t.type}
            message={t.message}
            onDismiss={removeToast}
          />
        );
      })}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  var addToast = useCallback(function (type, message, duration) {
    if (duration === undefined) duration = 4000;
    var id = Date.now() + Math.random();

    setToasts(function (prev) {
      return prev.concat([{ id: id, type: type, message: message }]);
    });

    if (duration > 0) {
      setTimeout(function () {
        setToasts(function (prev) {
          return prev.filter(function (t) { return t.id !== id; });
        });
      }, duration);
    }

    return id;
  }, []);

  var removeToast = useCallback(function (id) {
    setToasts(function (prev) {
      return prev.filter(function (t) { return t.id !== id; });
    });
  }, []);

  var toastApi = {
    success: function (msg, dur) { return addToast('success', msg, dur); },
    error: function (msg, dur) { return addToast('error', msg, dur); },
    warning: function (msg, dur) { return addToast('warning', msg, dur); },
    info: function (msg, dur) { return addToast('info', msg, dur); },
    dismiss: removeToast,
  };

  return (
    <ToastContext.Provider value={toastApi}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  var context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
