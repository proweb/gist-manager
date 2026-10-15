import {
  Star,
  Lock,
  Globe,
  FileCode2,
  Clock,
  ChevronRight,
} from 'lucide-react';
import {
  getPrimaryFilename,
  getFileCount,
  formatDate,
  formatSize,
  getTotalSize,
  getLanguageLabel,
  getLanguageColor,
} from '@/lib/gist-utils';
import type { Gist } from '@/types';

interface GistCardProps {
  gist: Gist;
  isStarred: boolean;
  onClick: () => void;
  onStarToggle: (e: React.MouseEvent) => void;
}

export function GistCard({ gist, isStarred, onClick, onStarToggle }: GistCardProps) {
  const filename = getPrimaryFilename(gist);
  const fileCount = getFileCount(gist);
  const totalSize = getTotalSize(gist);
  const langLabel = getLanguageLabel(filename, gist.files[filename]?.language || null);
  const langColor = getLanguageColor(filename, gist.files[filename]?.language || null);
  const description = gist.description || filename;

  return (
    <div
      onClick={onClick}
      className="group rounded-xl border p-4 cursor-pointer transition-md animate-fade-in-up"
      style={{
        borderColor: 'var(--border)',
        background: 'var(--bg-secondary)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-bright)';
        e.currentTarget.style.background = 'var(--bg-tertiary)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 18, 25, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.background = 'var(--bg-secondary)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0"
          style={{
            background: `${langColor}22`,
            border: `1px solid ${langColor}44`,
          }}
        >
          <FileCode2 size={20} style={{ color: langColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-semibold truncate"
            style={{ color: 'var(--text-primary)' }}
            title={description}
          >
            {description}
          </h3>
          <div
            className="flex items-center gap-2 mt-1 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            <span style={{ color: langColor }}>{langLabel}</span>
            <span>·</span>
            <span>{fileCount} {fileCount === 1 ? 'file' : 'files'}</span>
            <span>·</span>
            <span>{formatSize(totalSize)}</span>
          </div>
        </div>
        <button
          onClick={onStarToggle}
          className="flex items-center justify-center h-8 w-8 rounded-lg transition-sm flex-shrink-0"
          style={{
            background: isStarred ? 'rgba(251, 191, 36, 0.1)' : 'transparent',
          }}
          title={isStarred ? 'Unstar' : 'Star'}
        >
          <Star
            size={16}
            style={{
              color: isStarred ? 'var(--star)' : 'var(--text-muted)',
              fill: isStarred ? 'var(--star)' : 'none',
            }}
          />
        </button>
      </div>

      <div className="mt-3 pl-[52px]">
        <div
          className="code-block text-xs rounded-lg px-3 py-2 truncate"
          style={{
            background: 'var(--bg-primary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}
        >
          {gist.files[filename]?.content?.split('\n')[0] || `// ${filename}`}
        </div>
      </div>

      <div
        className="flex items-center justify-between mt-3 pl-[52px]"
      >
        <div
          className="flex items-center gap-2 text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          {gist.public ? (
            <span className="flex items-center gap-1">
              <Globe size={12} style={{ color: 'var(--accent)' }} />
              Public
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Lock size={12} style={{ color: 'var(--orange)' }} />
              Secret
            </span>
          )}
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatDate(gist.updated_at)}
          </span>
        </div>
        <ChevronRight
          size={16}
          className="transition-sm opacity-0 group-hover:opacity-100"
          style={{ color: 'var(--accent)' }}
        />
      </div>
    </div>
  );
}
