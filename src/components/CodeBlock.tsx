import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { highlightCode, copyToClipboard, getLanguageLabel } from '@/lib/gist-utils';
import type { GistFile } from '@/types';

interface CodeBlockProps {
  file: GistFile;
  maxHeight?: string;
}

export function CodeBlock({ file, maxHeight = '500px' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const content = file.content || '// Content unavailable';
  const language = getLanguageLabel(file.filename, file.language);
  const highlighted = highlightCode(content, file.language);

  const handleCopy = async () => {
    try {
      await copyToClipboard(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const lineCount = content.split('\n').length;
  const shouldCollapse = lineCount > 40 && !expanded;

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)' }}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{
          borderColor: 'var(--border)',
          background: 'var(--bg-secondary)',
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <FileDot filename={file.filename} />
          <span
            className="text-sm font-medium truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {file.filename}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
            }}
          >
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-sm flex-shrink-0"
          style={{
            background: copied ? 'rgba(45, 212, 191, 0.1)' : 'var(--bg-tertiary)',
            color: copied ? 'var(--accent)' : 'var(--text-secondary)',
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div
        className="overflow-auto"
        style={{ maxHeight: shouldCollapse ? maxHeight : undefined }}
      >
        <pre className="code-block p-4 m-0">
          <code dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
        {shouldCollapse && (
          <div
            className="relative"
            style={{
              marginTop: '-40px',
              height: '40px',
              background:
                'linear-gradient(to bottom, transparent, var(--bg-primary))',
            }}
          />
        )}
      </div>
      {lineCount > 40 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2 text-xs font-medium transition-sm border-t"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--accent)',
            background: 'var(--bg-secondary)',
          }}
        >
          {expanded ? 'Collapse' : `Expand (${lineCount} lines)`}
        </button>
      )}
    </div>
  );
}

function FileDot({ filename }: { filename: string }) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const colors: Record<string, string> = {
    js: '#f1e05a',
    ts: '#3178c6',
    jsx: '#f1e05a',
    tsx: '#3178c6',
    py: '#3572A5',
    rb: '#701516',
    go: '#00ADD8',
    rs: '#dea584',
    md: '#083fa1',
    json: '#cbcbcb',
    html: '#e34c26',
    css: '#563d7c',
    sh: '#89e051',
    yml: '#cb171e',
    yaml: '#cb171e',
    sql: '#e38c00',
  };
  const color = colors[ext] || 'var(--text-muted)';
  return (
    <span
      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
      style={{ background: color }}
    />
  );
}
