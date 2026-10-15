import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { ConfirmAction } from '@/types';

interface ConfirmDialogProps {
  action: ConfirmAction | null;
  onClose: () => void;
}

export function ConfirmDialog({ action, onClose }: ConfirmDialogProps) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!action) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action]);

  if (!action) return null;

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 150);
  };

  const handleConfirm = () => {
    action.onConfirm();
    handleClose();
  };

  return (
    <>
      <div className="backdrop" onClick={handleClose} />
      <div
        className={`fixed left-1/2 top-1/2 z-[101] -translate-x-1/2 -translate-y-1/2 ${closing ? '' : 'animate-scale-in'}`}
        style={{ animation: closing ? 'fadeIn 0.15s ease reverse' : undefined }}
      >
        <div
          className="w-[420px] max-w-[90vw] rounded-2xl border shadow-2xl"
          style={{
            borderColor: action.danger ? 'var(--danger)' : 'var(--border-bright)',
            background: 'var(--bg-elevated)',
          }}
        >
          <div className="flex items-start gap-4 p-6">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full flex-shrink-0"
              style={{
                background: action.danger
                  ? 'rgba(239, 68, 68, 0.12)'
                  : 'rgba(45, 212, 191, 0.12)',
              }}
            >
              <AlertTriangle
                size={22}
                style={{
                  color: action.danger ? 'var(--danger)' : 'var(--accent)',
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {action.title}
              </h3>
              <p className="mt-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {action.message}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="transition-sm opacity-50 hover:opacity-100 flex-shrink-0"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X size={18} />
            </button>
          </div>
          <div
            className="flex justify-end gap-3 px-6 py-4 border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            <button
              onClick={handleClose}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-sm"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-elevated)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-tertiary)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="rounded-lg px-4 py-2 text-sm font-semibold transition-sm"
              style={{
                background: action.danger ? 'var(--danger)' : 'var(--accent)',
                color: action.danger ? '#fff' : 'var(--bg-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.85';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              {action.confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
