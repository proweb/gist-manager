import { FileCode2, Search } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'search' | 'gists';
  title: string;
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = 'gists', title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-2xl mb-5"
        style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border)',
        }}
      >
        {icon === 'search' ? (
          <Search size={36} style={{ color: 'var(--text-muted)' }} />
        ) : (
          <FileCode2 size={36} style={{ color: 'var(--text-muted)' }} />
        )}
      </div>
      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p className="mt-1.5 text-sm max-w-sm" style={{ color: 'var(--text-secondary)' }}>
        {message}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
