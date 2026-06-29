"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────
type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  title: string;
  message?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

// ── Context ────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

// ── Icon map ───────────────────────────────────────────────
const ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle size={18} />,
  error: <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
};

const VARIANT_STYLES: Record<ToastVariant, { bar: string; icon: string; bg: string; border: string }> = {
  success: {
    bar: '#22C55E',
    icon: '#22C55E',
    bg: 'rgba(34,197,94,0.06)',
    border: 'rgba(34,197,94,0.2)',
  },
  error: {
    bar: '#EF4444',
    icon: '#EF4444',
    bg: 'rgba(239,68,68,0.06)',
    border: 'rgba(239,68,68,0.2)',
  },
  warning: {
    bar: '#F59E0B',
    icon: '#F59E0B',
    bg: 'rgba(245,158,11,0.06)',
    border: 'rgba(245,158,11,0.2)',
  },
  info: {
    bar: '#3B82F6',
    icon: '#3B82F6',
    bg: 'rgba(59,130,246,0.06)',
    border: 'rgba(59,130,246,0.2)',
  },
};

// ── Single Toast Item ──────────────────────────────────────
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const s = VARIANT_STYLES[toast.variant];

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${s.border}`,
        borderLeft: `4px solid ${s.bar}`,
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        minWidth: '300px',
        maxWidth: '420px',
        animation: 'toastSlideIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        backgroundColor: s.bg,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '2px',
          background: s.bar,
          animation: `toastProgress ${toast.duration ?? 4000}ms linear forwards`,
          opacity: 0.5,
        }}
      />

      {/* Icon */}
      <span style={{ color: s.icon, flexShrink: 0, marginTop: '1px' }}>
        {ICONS[toast.variant]}
      </span>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.875rem',
          fontWeight: 700,
          color: '#0B1329',
          lineHeight: 1.3,
        }}>
          {toast.title}
        </div>
        {toast.message && (
          <div style={{
            fontSize: '0.8125rem',
            color: '#64748B',
            marginTop: '0.2rem',
            lineHeight: 1.5,
          }}>
            {toast.message}
          </div>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        style={{
          background: 'none',
          border: 'none',
          color: '#94A3B8',
          cursor: 'pointer',
          padding: '0.15rem',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          transition: 'color 0.15s',
          minHeight: 'unset',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#475569')}
        onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ── Provider ───────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const toast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const duration = opts.duration ?? 4000;
    setToasts(prev => [...prev, { ...opts, id, duration }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const success = useCallback((title: string, message?: string) =>
    toast({ title, message, variant: 'success' }), [toast]);
  const error = useCallback((title: string, message?: string) =>
    toast({ title, message, variant: 'error' }), [toast]);
  const warning = useCallback((title: string, message?: string) =>
    toast({ title, message, variant: 'warning' }), [toast]);
  const info = useCallback((title: string, message?: string) =>
    toast({ title, message, variant: 'info' }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}

      {/* Toast Container — fixed top-right */}
      {toasts.length > 0 && (
        <div
          aria-label="Notifications"
          style={{
            position: 'fixed',
            top: '1.25rem',
            right: '1.25rem',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.625rem',
            pointerEvents: 'none',
          }}
        >
          {toasts.map(t => (
            <div key={t.id} style={{ pointerEvents: 'all' }}>
              <ToastItem toast={t} onDismiss={dismiss} />
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
