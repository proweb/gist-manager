import { useState } from 'react';
import {
  ArrowLeft,
  Star,
  Lock,
  Globe,
  Edit3,
  Trash2,
  ExternalLink,
  Clock,
  FileCode2,
  Copy,
  Check,
  Calendar,
} from 'lucide-react';
import { CodeBlock } from '@/components/CodeBlock';
import {
  formatDate,
  formatDateFull,
  getFileCount,
  formatSize,
  getTotalSize,
  getLanguageLabel,
  getLanguageColor,
} from '@/lib/gist-utils';
import { copyToClipboard } from '@/lib/gist-utils';
import type { Gist } from '@/types';

interface GistDetailProps {
  gist: Gist;
  isStarred: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStarToggle: () => void;
}

export function GistDetail({
  gist,
  isStarred,
  onBack,
  onEdit,
  onDelete,
  onStarToggle,
}: GistDetailProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const fileCount = getFileCount(gist);
  const totalSize = getTotalSize(gist);
  const fileNames = Object.keys(gist.files);
  const [activeFile, setActiveFile] = useState(fileNames[0] || '');

  const currentFile = gist.files[activeFile];

  const handleCopyUrl = async () => {
    try {
      await copyToClipboard(gist.html_url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex-1 overflow-auto animate-fade-in">
      {/* Top bar */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 px-6 py-3 border-b"
        style={{
          borderColor: 'var(--border)',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-sm"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-tertiary)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <div className="flex-1" />
        <button
          onClick={onStarToggle}
          className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-sm"
          style={{
            background: isStarred ? 'rgba(251, 191, 36, 0.1)' : 'var(--bg-tertiary)',
            color: isStarred ? 'var(--star)' : 'var(--text-secondary)',
          }}
        >
          <Star
            size={16}
            style={{
              fill: isStarred ? 'var(--star)' : 'none',
            }}
          />
          {isStarred ? 'Starred' : 'Star'}
        </button>
        <button
          onClick={onEdit}
          className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-sm"
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-elevated)';
            e.currentTarget.style.color = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-tertiary)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <Edit3 size={16} />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-sm"
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.color = 'var(--danger)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-tertiary)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start gap-3">
            {gist.public ? (
              <div
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 mt-1"
                style={{
                  background: 'rgba(45, 212, 191, 0.1)',
                  color: 'var(--accent)',
                }}
              >
                <Globe size={12} />
                Public
              </div>
            ) : (
              <div
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 mt-1"
                style={{
                  background: 'rgba(249, 115, 22, 0.1)',
                  color: 'var(--orange)',
                }}
              >
                <Lock size={12} />
                Secret
              </div>
            )}
          </div>
          <h1
            className="text-2xl font-bold mt-3"
            style={{ color: 'var(--text-primary)' }}
          >
            {gist.description || fileNames[0] || 'Untitled Gist'}
          </h1>
          <div
            className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            <span className="flex items-center gap-1.5">
              <FileCode2 size={14} />
              {fileCount} {fileCount === 1 ? 'file' : 'files'}
            </span>
            <span>·</span>
            <span>{formatSize(totalSize)}</span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              Updated {formatDate(gist.updated_at)}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              Created {formatDate(gist.created_at)}
            </span>
          </div>
        </div>

        {/* URL bar */}
        <div
          className="flex items-center gap-2 rounded-xl border px-4 py-2.5 mb-5"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--bg-secondary)',
          }}
        >
          <span
            className="text-xs font-mono truncate flex-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            {gist.html_url}
          </span>
          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-sm flex-shrink-0"
            style={{
              background: copiedUrl ? 'rgba(45, 212, 191, 0.1)' : 'var(--bg-tertiary)',
              color: copiedUrl ? 'var(--accent)' : 'var(--text-secondary)',
            }}
          >
            {copiedUrl ? <Check size={14} /> : <Copy size={14} />}
            {copiedUrl ? 'Copied' : 'Copy URL'}
          </button>
          <a
            href={gist.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-sm flex-shrink-0"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
            }}
          >
            <ExternalLink size={14} />
            Open
          </a>
        </div>

        {/* File tabs */}
        {fileNames.length > 1 && (
          <div className="flex gap-1 mb-3 overflow-x-auto no-scrollbar">
            {fileNames.map((name) => {
              const f = gist.files[name];
              const langColor = getLanguageColor(name, f.language);
              const active = name === activeFile;
              return (
                <button
                  key={name}
                  onClick={() => setActiveFile(name)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-sm"
                  style={{
                    background: active ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                    border: `1px solid ${active ? 'var(--border-bright)' : 'var(--border)'}`,
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: langColor }}
                  />
                  {name}
                </button>
              );
            })}
          </div>
        )}

        {/* Active file code block */}
        {currentFile && (
          <CodeBlock file={currentFile} maxHeight="600px" />
        )}

        {/* All files summary */}
        {fileNames.length > 1 && (
          <div
            className="mt-6 rounded-xl border p-4"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-secondary)',
            }}
          >
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              All Files
            </h3>
            <div className="space-y-2">
              {fileNames.map((name) => {
                const f = gist.files[name];
                const langLabel = getLanguageLabel(name, f.language);
                const langColor = getLanguageColor(name, f.language);
                return (
                  <div
                    key={name}
                    className="flex items-center gap-3 text-sm py-2 px-3 rounded-lg transition-sm cursor-pointer"
                    style={{ background: 'var(--bg-primary)' }}
                    onClick={() => setActiveFile(name)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bg-primary)';
                    }}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: langColor }}
                    />
                    <span
                      className="font-medium flex-1 truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {name}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {langLabel}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {formatSize(f.size)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Meta */}
        <div
          className="mt-6 text-xs flex items-center gap-4"
          style={{ color: 'var(--text-muted)' }}
        >
          <span>Gist ID: <span className="font-mono">{gist.id}</span></span>
          <span>·</span>
          <span>Created: {formatDateFull(gist.created_at)}</span>
          <span>·</span>
          <span>Updated: {formatDateFull(gist.updated_at)}</span>
        </div>
      </div>
    </div>
  );
}
