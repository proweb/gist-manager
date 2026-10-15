import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import type { ToastMessage } from '@/types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const config = {
    success: { icon: CheckCircle2, color: 'var(--accent)', bg: 'rgba(45, 212, 191, 0.1)' },
    error: { icon: AlertCircle, color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.1)' },
    info: { icon: Info, color: '#2563eb', bg: 'rgba(37, 99, 235, 0.08)' },
  };
  const { icon: Icon, color, bg } = config[toast.type];

  return (
    <div
      className="toast-item animate-slide-in-right flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl"
      style={{
        borderColor: color,
        background: `linear-gradient(135deg, ${bg}, var(--bg-elevated))`,
        minWidth: '300px',
        maxWidth: '400px',
      }}
    >
      <Icon size={20} style={{ color, flexShrink: 0, marginTop: '1px' }} />
      <p className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="transition-sm opacity-50 hover:opacity-100"
        style={{ color: 'var(--text-secondary)' }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: ToastMessage['type'], message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, showToast, dismissToast };
}
