import type { Gist, GistFilter } from '@/types';

const SEARCH_THRESHOLD = 100_000;

export function filterGists(
  gists: Gist[],
  filter: GistFilter,
  starredIds: Set<string>,
  ownedIds: Set<string>
): Gist[] {
  return gists.filter((g) => {
    if (filter === 'public') return ownedIds.has(g.id) && g.public;
    if (filter === 'secret') return ownedIds.has(g.id) && !g.public;
    if (filter === 'starred') return starredIds.has(g.id);
    return ownedIds.has(g.id);
  });
}

export function searchGists(
  gists: Gist[],
  query: string
): Gist[] {
  const q = query.trim().toLowerCase();
  if (!q) return gists;

  return gists.filter((g) => {
    const desc = (g.description || '').toLowerCase();
    if (desc.includes(q)) return true;

    if (g._starred || true) {
      // search file names and content (if available)
      for (const file of Object.values(g.files)) {
        if (file.filename.toLowerCase().includes(q)) return true;
        if (file.content && file.size < SEARCH_THRESHOLD) {
          if (file.content.toLowerCase().includes(q)) return true;
        }
      }
    }
    return false;
  });
}

export function sortGists(
  gists: Gist[],
  sortBy: 'updated' | 'created' | 'name'
): Gist[] {
  const sorted = [...gists];
  if (sortBy === 'updated') {
    sorted.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  } else if (sortBy === 'created') {
    sorted.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } else if (sortBy === 'name') {
    sorted.sort((a, b) => {
      const aName = (a.description || getPrimaryFilename(a) || '').toLowerCase();
      const bName = (b.description || getPrimaryFilename(b) || '').toLowerCase();
      return aName.localeCompare(bName);
    });
  }
  return sorted;
}

export function getPrimaryFilename(gist: Gist): string {
  const files = Object.keys(gist.files);
  return files[0] || 'unknown';
}

export function getFileCount(gist: Gist): number {
  return Object.keys(gist.files).length;
}

export function getTotalSize(gist: Gist): number {
  return Object.values(gist.files).reduce((sum, f) => sum + f.size, 0);
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)}mo ago`;
  return `${Math.floor(diffDay / 365)}y ago`;
}

export function formatDateFull(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const EXTENSION_MAP: Record<string, string> = {
  ts: 'TypeScript',
  tsx: 'TypeScript React',
  js: 'JavaScript',
  jsx: 'JavaScript React',
  py: 'Python',
  rb: 'Ruby',
  go: 'Go',
  rs: 'Rust',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  h: 'C Header',
  hpp: 'C++ Header',
  cs: 'C#',
  php: 'PHP',
  swift: 'Swift',
  kt: 'Kotlin',
  sh: 'Shell',
  bash: 'Bash',
  zsh: 'Zsh',
  fish: 'Fish',
  yml: 'YAML',
  yaml: 'YAML',
  json: 'JSON',
  xml: 'XML',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  sass: 'SASS',
  less: 'LESS',
  md: 'Markdown',
  markdown: 'Markdown',
  sql: 'SQL',
  dockerfile: 'Dockerfile',
  graphql: 'GraphQL',
  gql: 'GraphQL',
  toml: 'TOML',
  ini: 'INI',
  env: 'Env',
  txt: 'Text',
  vue: 'Vue',
  svelte: 'Svelte',
  dart: 'Dart',
  scala: 'Scala',
  clj: 'Clojure',
  ex: 'Elixir',
  exs: 'Elixir',
  erl: 'Erlang',
  lua: 'Lua',
  r: 'R',
  pl: 'Perl',
  pm: 'Perl',
  elm: 'Elm',
  hs: 'Haskell',
  ml: 'OCaml',
  fs: 'F#',
  nim: 'Nim',
  zig: 'Zig',
  v: 'V',
  proto: 'Protocol Buffers',
  tf: 'Terraform',
  gradle: 'Gradle',
  makefile: 'Makefile',
  cmake: 'CMake',
  bat: 'Batch',
  ps1: 'PowerShell',
  jl: 'Julia',
};

export function getLanguageLabel(filename: string, language: string | null): string {
  if (language) return language;
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return EXTENSION_MAP[ext] || 'Text';
}

export function getLanguageColor(filename: string, language: string | null): string {
  const lang = getLanguageLabel(filename, language).toLowerCase();
  const colorMap: Record<string, string> = {
    javascript: '#f1e05a',
    typescript: '#3178c6',
    python: '#3572A5',
    ruby: '#701516',
    go: '#00ADD8',
    rust: '#dea584',
    java: '#b07219',
    c: '#555555',
    'c++': '#f34b7d',
    'c#': '#178600',
    php: '#4F5D95',
    swift: '#F05138',
    kotlin: '#A97BFF',
    shell: '#89e051',
    bash: '#89e051',
    html: '#e34c26',
    css: '#563d7c',
    scss: '#c6538c',
    markdown: '#083fa1',
    json: '#292929',
    yaml: '#cb171e',
    sql: '#e38c00',
    dockerfile: '#384d54',
    vue: '#41b883',
    svelte: '#ff3e00',
    dart: '#00B4AB',
    scala: '#c22d40',
    clojure: '#db5855',
    elixir: '#6e4a7e',
    haskell: '#5e5086',
    lua: '#000080',
    r: '#198CE7',
    perl: '#0298c3',
    julia: '#a270ba',
    'protocol buffers': '#427819',
    terraform: '#3572A5',
  };
  return colorMap[lang] || '#6a6a85';
}

export function getFileIconName(filename: string, language: string | null): string {
  const lang = getLanguageLabel(filename, language).toLowerCase();
  if (lang.includes('markdown')) return 'markdown';
  if (lang.includes('json')) return 'json';
  if (lang.includes('yaml')) return 'yaml';
  if (lang.includes('python')) return 'python';
  if (lang.includes('typescript')) return 'typescript';
  if (lang.includes('javascript')) return 'javascript';
  if (lang.includes('shell') || lang.includes('bash')) return 'shell';
  if (lang.includes('html')) return 'html';
  if (lang.includes('css') || lang.includes('scss')) return 'css';
  if (lang.includes('sql')) return 'sql';
  if (lang.includes('docker')) return 'docker';
  if (lang.includes('go')) return 'go';
  if (lang.includes('rust')) return 'rust';
  if (lang.includes('ruby')) return 'ruby';
  return 'file';
}

export function highlightCode(
  code: string,
  language: string | null
): string {
  const lang = (language || '').toLowerCase();

  // Escape HTML first
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // For markdown, no syntax highlighting
  if (lang.includes('markdown') || lang.includes('text') || !language) {
    return escaped;
  }

  // Token-based highlighting using regex replacement
  // Order matters: comments first, then strings, then keywords/numbers

  let result = escaped;

  // Comments (// and # and /* */)
  if (
    lang.includes('javascript') ||
    lang.includes('typescript') ||
    lang.includes('c') ||
    lang.includes('java') ||
    lang.includes('go') ||
    lang.includes('rust') ||
    lang.includes('css') ||
    lang.includes('scss') ||
    lang.includes('dart') ||
    lang.includes('kotlin') ||
    lang.includes('swift')
  ) {
    result = result.replace(
      /(\/\/[^\n]*)/g,
      '<span class="syntax-comment">$1</span>'
    );
    result = result.replace(
      /(\/\*[\s\S]*?\*\/)/g,
      '<span class="syntax-comment">$1</span>'
    );
  }

  if (
    lang.includes('python') ||
    lang.includes('ruby') ||
    lang.includes('shell') ||
    lang.includes('bash') ||
    lang.includes('yaml') ||
    lang.includes('toml') ||
    lang.includes('perl') ||
    lang.includes('r')
  ) {
    result = result.replace(
      /(^|\n)(#[^\n]*)/g,
      '$1<span class="syntax-comment">$2</span>'
    );
  }

  if (lang.includes('sql')) {
    result = result.replace(
      /(--[^\n]*)/g,
      '<span class="syntax-comment">$1</span>'
    );
  }

  // Strings (single, double, backtick)
  result = result.replace(
    /(["'`])((?:\\.|(?!\1).)*)\1/g,
    '<span class="syntax-string">$1$2$1</span>'
  );

  // Keywords
  const keywords: Record<string, string[]> = {
    javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'extends', 'import', 'export', 'from', 'default', 'async', 'await', 'new', 'this', 'typeof', 'instanceof', 'try', 'catch', 'finally', 'throw', 'break', 'continue', 'switch', 'case', 'do', 'in', 'of', 'yield', 'delete', 'void', 'null', 'undefined', 'true', 'false'],
    typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'extends', 'import', 'export', 'from', 'default', 'async', 'await', 'new', 'this', 'typeof', 'instanceof', 'try', 'catch', 'finally', 'throw', 'break', 'continue', 'switch', 'case', 'do', 'in', 'of', 'yield', 'delete', 'void', 'null', 'undefined', 'true', 'false', 'type', 'interface', 'enum', 'namespace', 'public', 'private', 'protected', 'readonly', 'as', 'is', 'implements', 'abstract', 'declare'],
    python: ['def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'import', 'from', 'as', 'try', 'except', 'finally', 'raise', 'with', 'lambda', 'yield', 'global', 'nonlocal', 'pass', 'break', 'continue', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is', 'assert', 'del', 'async', 'await'],
    go: ['func', 'var', 'const', 'type', 'struct', 'interface', 'package', 'import', 'return', 'if', 'else', 'for', 'range', 'switch', 'case', 'default', 'defer', 'go', 'chan', 'select', 'break', 'continue', 'map', 'nil', 'true', 'false'],
    rust: ['fn', 'let', 'mut', 'const', 'struct', 'enum', 'trait', 'impl', 'pub', 'use', 'mod', 'return', 'if', 'else', 'for', 'while', 'loop', 'match', 'as', 'in', 'ref', 'move', 'async', 'await', 'unsafe', 'true', 'false', 'self', 'Self'],
    ruby: ['def', 'class', 'module', 'return', 'if', 'elsif', 'else', 'unless', 'while', 'until', 'for', 'do', 'begin', 'rescue', 'ensure', 'raise', 'yield', 'lambda', 'proc', 'require', 'require_relative', 'include', 'extend', 'attr_accessor', 'attr_reader', 'attr_writer', 'nil', 'true', 'false', 'self', 'end', 'then'],
    java: ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'new', 'this', 'super', 'try', 'catch', 'finally', 'throw', 'throws', 'import', 'package', 'static', 'final', 'void', 'int', 'long', 'double', 'float', 'boolean', 'char', 'byte', 'short', 'null', 'true', 'false', 'instanceof'],
    sql: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'VIEW', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AS', 'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'LIKE', 'BETWEEN', 'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'UNION', 'ALL', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'DEFAULT', 'UNIQUE', 'CASCADE', 'INTO', 'VALUES', 'SET'],
  };

  const kwList = keywords[lang] || keywords.javascript;
  const kwPattern = new RegExp(
    `\\b(${kwList.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
    'g'
  );
  result = result.replace(kwPattern, '<span class="syntax-keyword">$1</span>');

  // Numbers
  result = result.replace(
    /\b(\d+\.?\d*)\b/g,
    '<span class="syntax-number">$1</span>'
  );

  // Function calls (word followed by paren)
  result = result.replace(
    /\b([a-zA-Z_]\w*)(\s*\()/g,
    '<span class="syntax-function">$1</span>$2'
  );

  return result;
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}
