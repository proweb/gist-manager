import {
  FileCode2,
  Globe,
  Lock,
  Star,
  Plus,
  LogOut,
  Search,
  Github,
} from 'lucide-react';
import type { GitHubUser, GistFilter } from '@/types';

interface SidebarProps {
  user: GitHubUser;
  filter: GistFilter;
  onFilterChange: (f: GistFilter) => void;
  counts: { all: number; public: number; secret: number; starred: number };
  onLogout: () => void;
  onNewGist: () => void;
  search: string;
  onSearchChange: (s: string) => void;
  collapsed: boolean;
}

export function Sidebar({
  user,
  filter,
  onFilterChange,
  counts,
  onLogout,
  onNewGist,
  search,
  onSearchChange,
  collapsed,
}: SidebarProps) {
  const navItems: {
    key: GistFilter;
    label: string;
    icon: React.ReactNode;
    count: number;
    color: string;
  }[] = [
    {
      key: 'all',
      label: 'All Gists',
      icon: <FileCode2 size={18} />,
      count: counts.all,
      color: 'var(--text-primary)',
    },
    {
      key: 'public',
      label: 'Public',
      icon: <Globe size={18} />,
      count: counts.public,
      color: 'var(--accent)',
    },
    {
      key: 'secret',
      label: 'Secret',
      icon: <Lock size={18} />,
      count: counts.secret,
      color: 'var(--orange)',
    },
    {
      key: 'starred',
      label: 'Starred',
      icon: <Star size={18} />,
      count: counts.starred,
      color: 'var(--star)',
    },
  ];

  return (
    <aside
      className="flex flex-col transition-md flex-shrink-0"
      style={{
        width: collapsed ? '0px' : '280px',
        overflow: 'hidden',
        borderRight: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
      }}
    >
      <div className="w-[280px] h-full flex flex-col">
        {/* Logo header */}
        <div
          className="flex items-center gap-2.5 px-5 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
            }}
          >
            <FileCode2 size={20} style={{ color: 'var(--bg-primary)' }} />
          </div>
          <span className="text-lg font-bold gradient-text">GistHub</span>
        </div>

        {/* New Gist button */}
        <div className="px-4 pt-4">
          <button
            onClick={onNewGist}
            className="w-full rounded-xl py-2.5 text-sm font-semibold transition-sm flex items-center justify-center gap-2"
            style={{
              background: 'var(--bg-elevated)',
              color: 'var(--accent)',
              border: '1px solid var(--accent-dim)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-glow)';
              e.currentTarget.style.borderColor = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-elevated)';
              e.currentTarget.style.borderColor = 'var(--accent-dim)';
            }}
          >
            <Plus size={18} />
            New Gist
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-4">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search gists..."
              className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm transition-sm"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        {/* Nav items */}
        <nav className="px-4 pt-4 space-y-1">
          <p
            className="text-xs font-semibold uppercase tracking-wider px-3 pb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Library
          </p>
          {navItems.map((item) => {
            const active = filter === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onFilterChange(item.key)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-sm"
                style={{
                  background: active ? 'var(--bg-elevated)' : 'transparent',
                  color: active ? item.color : 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (!active)
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ color: active ? item.color : 'var(--text-muted)' }}>
                  {item.icon}
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: active ? 'var(--bg-primary)' : 'var(--bg-tertiary)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </nav>

        {/* User section at bottom */}
        <div className="mt-auto">
          <div
            className="px-4 py-3 border-t flex items-center gap-3"
            style={{ borderColor: 'var(--border)' }}
          >
            <img
              src={user.avatar_url}
              alt={user.login}
              className="h-9 w-9 rounded-full"
              style={{ border: '2px solid var(--border-bright)' }}
            />
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {user.name || user.login}
              </p>
              <p
                className="text-xs truncate"
                style={{ color: 'var(--text-muted)' }}
              >
                {user.public_gists} gists
              </p>
            </div>
            <a
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-sm opacity-50 hover:opacity-100"
              style={{ color: 'var(--text-secondary)' }}
              title="GitHub Profile"
            >
              <Github size={18} />
            </a>
            <button
              onClick={onLogout}
              className="transition-sm opacity-50 hover:opacity-100"
              style={{ color: 'var(--danger)' }}
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
