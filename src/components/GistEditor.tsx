import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileCode2,
  Loader2,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';
import type { Gist, GistFileInput } from '@/types';

interface GistEditorProps {
  gist: Gist | null;
  onSave: (
    description: string,
    isPublic: boolean,
    files: GistFileInput[],
    originalFilenames: string[]
  ) => Promise<void>;
  onCancel: () => void;
}

export function GistEditor({ gist, onSave, onCancel }: GistEditorProps) {
  const isEdit = !!gist;
  const originalFilenames = gist ? Object.keys(gist.files) : [];

  const [description, setDescription] = useState(
    gist?.description || ''
  );
  const [isPublic, setIsPublic] = useState(gist?.public ?? false);
  const [files, setFiles] = useState<GistFileInput[]>(() => {
    if (gist) {
      return Object.entries(gist.files).map(([name, f]) => ({
        filename: name,
        content: f.content || '',
      }));
    }
    return [{ filename: '', content: '' }];
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onCancel();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [saving, onCancel]);

  const addFile = () => {
    setFiles([...files, { filename: '', content: '' }]);
  };

  const removeFile = (index: number) => {
    if (files.length === 1) return;
    setFiles(files.filter((_, i) => i !== index));
  };

  const updateFile = (index: number, field: keyof GistFileInput, value: string) => {
    setFiles(files.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
  };

  const handleSave = async () => {
    setError('');

    const validFiles = files.filter((f) => f.filename.trim());
    if (validFiles.length === 0) {
      setError('At least one file with a filename is required');
      return;
    }

    // Check for duplicate filenames
    const filenames = validFiles.map((f) => f.filename.trim());
    const duplicates = filenames.filter((n, i) => filenames.indexOf(n) !== i);
    if (duplicates.length > 0) {
      setError(`Duplicate filename: ${duplicates[0]}`);
      return;
    }

    setSaving(true);
    try {
      await onSave(description.trim(), isPublic, validFiles, originalFilenames);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save gist');
      setSaving(false);
    }
  };

  const totalSize = files.reduce(
    (sum, f) => sum + new Blob([f.content]).size,
    0
  );

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
          onClick={onCancel}
          disabled={saving}
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
          Cancel
        </button>
        <div className="flex-1" />
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-1.5 rounded-lg transition-sm disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
            color: 'var(--bg-primary)',
          }}
        >
          {saving ? (
            <>
              <Loader2 size={16} className="spin" />
              Saving...
            </>
          ) : (
            isEdit ? 'Save Changes' : 'Create Gist'
          )}
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6">
        <h1
          className="text-2xl font-bold mb-6"
          style={{ color: 'var(--text-primary)' }}
        >
          {isEdit ? 'Edit Gist' : 'New Gist'}
        </h1>

        {error && (
          <div
            className="text-sm px-4 py-3 rounded-xl mb-4 animate-fade-in"
            style={{
              color: 'var(--danger)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--danger)',
            }}
          >
            {error}
          </div>
        )}

        {/* Description */}
        <div className="mb-5">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A brief description of your gist..."
            className="w-full rounded-xl border px-4 py-3 text-sm transition-sm"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Visibility */}
        <div className="mb-6">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Visibility
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setIsPublic(true)}
              className="flex-1 rounded-xl border p-4 text-left transition-md"
              style={{
                borderColor: isPublic ? 'var(--accent)' : 'var(--border)',
                background: isPublic ? 'rgba(45, 212, 191, 0.05)' : 'var(--bg-secondary)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Eye
                  size={18}
                  style={{ color: isPublic ? 'var(--accent)' : 'var(--text-muted)' }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: isPublic ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                >
                  Public
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Visible to everyone on GitHub
              </p>
            </button>
            <button
              onClick={() => setIsPublic(false)}
              className="flex-1 rounded-xl border p-4 text-left transition-md"
              style={{
                borderColor: !isPublic ? 'var(--orange)' : 'var(--border)',
                background: !isPublic ? 'rgba(249, 115, 22, 0.05)' : 'var(--bg-secondary)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <EyeOff
                  size={18}
                  style={{ color: !isPublic ? 'var(--orange)' : 'var(--text-muted)' }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: !isPublic ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                >
                  Secret
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Only visible to you
              </p>
            </button>
          </div>
        </div>

        {/* Files */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <label
              className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              Files
            </label>
            <button
              onClick={addFile}
              disabled={saving}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-sm disabled:opacity-50"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--accent)',
              }}
            >
              <Plus size={14} />
              Add File
            </button>
          </div>

          <div className="space-y-4">
            {files.map((file, index) => (
              <div
                key={index}
                className="rounded-xl border overflow-hidden animate-fade-in-up"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--bg-secondary)',
                }}
              >
                {/* File header */}
                <div
                  className="flex items-center gap-2 px-4 py-3 border-b"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <FileCode2
                    size={18}
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <input
                    type="text"
                    value={file.filename}
                    onChange={(e) => updateFile(index, 'filename', e.target.value)}
                    placeholder="filename.ext"
                    disabled={saving}
                    className="flex-1 bg-transparent text-sm font-medium px-2 py-1 rounded transition-sm"
                    style={{ color: 'var(--text-primary)' }}
                  />
                  {files.length > 1 && (
                    <button
                      onClick={() => removeFile(index)}
                      disabled={saving}
                      className="transition-sm opacity-50 hover:opacity-100 p-1 rounded"
                      style={{ color: 'var(--danger)' }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                {/* File content */}
                <textarea
                  value={file.content}
                  onChange={(e) => updateFile(index, 'content', e.target.value)}
                  placeholder="// Write your code here..."
                  disabled={saving}
                  className="code-block w-full p-4 bg-transparent border-none outline-none resize-y"
                  style={{
                    color: 'var(--text-primary)',
                    minHeight: '200px',
                  }}
                  spellCheck={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div
          className="flex items-center justify-between text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          <span>{files.length} {files.length === 1 ? 'file' : 'files'} · {formatBytes(totalSize)}</span>
          {isEdit && (
            <span className="flex items-center gap-1">
              <Trash2 size={12} />
              Renaming or emptying a file will delete it from the gist
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
