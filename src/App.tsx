import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthScreen } from '@/components/AuthScreen';
import { Sidebar } from '@/components/Sidebar';
import { GistCard } from '@/components/GistCard';
import { GistDetail } from '@/components/GistDetail';
import { GistEditor } from '@/components/GistEditor';
import { ToastContainer, useToasts } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SkeletonGistList, SkeletonDetail } from '@/components/SkeletonLoader';
import { EmptyState } from '@/components/EmptyState';
import {
  fetchUser,
  fetchGists,
  fetchStarredGists,
  fetchGist,
  createGist,
  updateGist,
  deleteGist,
  starGist,
  unstarGist,
} from '@/lib/github';
import { loadToken, saveToken, clearToken } from '@/lib/storage';
import { filterGists, searchGists, sortGists } from '@/lib/gist-utils';
import type {
  Gist,
  GitHubUser,
  GistFilter,
  View,
  GistFileInput,
  ConfirmAction,
} from '@/types';

export default function App() {
  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Data state
  const [gists, setGists] = useState<Gist[]>([]);
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [loadingGists, setLoadingGists] = useState(false);

  // UI state
  const [view, setView] = useState<View>('list');
  const [filter, setFilter] = useState<GistFilter>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'name'>('updated');
  const [selectedGist, setSelectedGist] = useState<Gist | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const { toasts, showToast, dismissToast } = useToasts();

  // Restore token on mount
  useEffect(() => {
    const stored = loadToken();
    if (stored) {
      authenticate(stored);
    }
  }, []);

  const authenticate = async (tok: string): Promise<boolean> => {
    setAuthLoading(true);
    try {
      const u = await fetchUser(tok);
      setToken(tok);
      setUser(u);
      saveToken(tok);
      setAuthLoading(false);
      await loadAllGists(tok);
      return true;
    } catch {
      setAuthLoading(false);
      return false;
    }
  };

  const loadAllGists = async (tok: string) => {
    setLoadingGists(true);
    try {
      const [all, starred] = await Promise.all([
        fetchGists(tok),
        fetchStarredGists(tok),
      ]);
      const starSet = new Set(starred.map((g) => g.id));
      const ownSet = new Set(all.map((g) => g.id));

      // Merge: own gists + starred gists that aren't ours
      const starredNotOwned = starred.filter((g) => !ownSet.has(g.id));
      const merged = [...all, ...starredNotOwned];

      // Fetch full content for each gist
      const gistsWithContent = await Promise.all(
        merged.map(async (g) => {
          try {
            const full = await fetchGist(tok, g.id);
            return { ...full, _starred: starSet.has(g.id) };
          } catch {
            return { ...g, _starred: starSet.has(g.id) };
          }
        })
      );

      // Deduplicate by gist ID
      const seen = new Set<string>();
      const deduped = gistsWithContent.filter((g) => {
        if (seen.has(g.id)) return false;
        seen.add(g.id);
        return true;
      });

      setGists(deduped);
      setStarredIds(starSet);
      setOwnedIds(ownSet);
    } catch (e) {
      showToast('error', `Failed to load gists: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setLoadingGists(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    setToken(null);
    setUser(null);
    setGists([]);
    setStarredIds(new Set());
    setOwnedIds(new Set());
    setView('list');
    setSelectedGist(null);
  };

  const handleGistClick = async (gist: Gist) => {
    setSelectedGist(gist);
    setView('detail');
    setDetailLoading(true);
    try {
      const full = await fetchGist(token!, gist.id);
      setSelectedGist(full);
    } catch {
      // use the already-loaded gist
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStarToggle = async (gist: Gist) => {
    const isStarred = starredIds.has(gist.id);
    try {
      if (isStarred) {
        await unstarGist(token!, gist.id);
        setStarredIds((prev) => {
          const next = new Set(prev);
          next.delete(gist.id);
          return next;
        });
        showToast('info', 'Gist unstarred');
      } else {
        await starGist(token!, gist.id);
        setStarredIds((prev) => new Set(prev).add(gist.id));
        showToast('success', 'Gist starred');
      }
    } catch (e) {
      showToast('error', `Failed to toggle star: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  };

  const handleDelete = (gist: Gist) => {
    setConfirmAction({
      title: 'Delete Gist',
      message: `Are you sure you want to delete "${gist.description || Object.keys(gist.files)[0]}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: async () => {
        try {
          await deleteGist(token!, gist.id);
          setGists((prev) => prev.filter((g) => g.id !== gist.id));
          setStarredIds((prev) => {
            const next = new Set(prev);
            next.delete(gist.id);
            return next;
          });
          showToast('success', 'Gist deleted');
          if (view === 'detail') setView('list');
        } catch (e) {
          showToast('error', `Failed to delete: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
      },
    });
  };

  const handleCreateGist = async (
    description: string,
    isPublic: boolean,
    files: GistFileInput[]
  ) => {
    const fileMap: Record<string, { content: string }> = {};
    for (const f of files) {
      fileMap[f.filename.trim()] = { content: f.content };
    }

    const created = await createGist(token!, {
      description,
      public: isPublic,
      files: fileMap,
    });

    // Fetch full content
    try {
      const full = await fetchGist(token!, created.id);
      setGists((prev) => [full, ...prev]);
    } catch {
      setGists((prev) => [created, ...prev]);
    }
    showToast('success', 'Gist created successfully');
    setView('list');
  };

  const handleUpdateGist = async (
    description: string,
    isPublic: boolean,
    files: GistFileInput[],
    originalFilenames: string[]
  ) => {
    if (!selectedGist) return;

    const filePayload: Record<string, { content?: string; filename?: string } | null> = {};

    // Map new files
    for (const f of files) {
      const trimmedName = f.filename.trim();
      filePayload[trimmedName] = { content: f.content };
    }

    // Mark deleted files (original names not in new files)
    for (const origName of originalFilenames) {
      if (!files.some((f) => f.filename.trim() === origName)) {
        filePayload[origName] = null;
      }
    }

    // Note: GitHub API doesn't allow changing visibility via PATCH,
    // so we only update description and files
    const updated = await updateGist(token!, selectedGist.id, {
      description: description,
      files: filePayload,
    });

    // Fetch full content
    try {
      const full = await fetchGist(token!, updated.id);
      setGists((prev) => prev.map((g) => (g.id === updated.id ? full : g)));
      setSelectedGist(full);
    } catch {
      setGists((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      setSelectedGist(updated);
    }

    showToast('success', 'Gist updated successfully');
    setView('detail');
  };

  // Filtered and sorted gists for list view
  const displayedGists = useMemo(() => {
    const filtered = filterGists(gists, filter, starredIds, ownedIds);
    const searched = searchGists(filtered, search);
    return sortGists(searched, sortBy);
  }, [gists, filter, starredIds, ownedIds, search, sortBy]);

  const counts = useMemo(
    () => ({
      all: ownedIds.size,
      public: gists.filter((g) => g.public).length,
      secret: gists.filter((g) => !g.public).length,
      starred: starredIds.size,
    }),
    [gists, starredIds]
  );

  const sidebarCollapsed = view === 'create' || view === 'edit';

  // Loading auth
  if (authLoading && !token) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div className="animate-fade-in flex flex-col items-center gap-3">
          <div
            className="h-12 w-12 rounded-full border-4 spin"
            style={{
              borderColor: 'var(--border)',
              borderTopColor: 'var(--accent)',
            }}
          />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Connecting to GitHub...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!token || !user) {
    return <AuthScreen onAuthenticate={authenticate} />;
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar
        user={user}
        filter={filter}
        onFilterChange={setFilter}
        counts={counts}
        onLogout={handleLogout}
        onNewGist={() => {
          setSelectedGist(null);
          setView('create');
        }}
        search={search}
        onSearchChange={setSearch}
        collapsed={sidebarCollapsed}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {view === 'list' && (
          <GistListView
            gists={displayedGists}
            loading={loadingGists}
            filter={filter}
            search={search}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onGistClick={handleGistClick}
            onStarToggle={handleStarToggle}
            starredIds={starredIds}
            onNewGist={() => {
              setSelectedGist(null);
              setView('create');
            }}
          />
        )}

        {view === 'detail' && selectedGist && (
          <>
            {detailLoading ? (
              <div className="flex-1 overflow-auto p-6">
                <div className="max-w-4xl mx-auto">
                  <SkeletonDetail />
                </div>
              </div>
            ) : (
              <GistDetail
                gist={selectedGist}
                isStarred={starredIds.has(selectedGist.id)}
                onBack={() => setView('list')}
                onEdit={() => setView('edit')}
                onDelete={() => handleDelete(selectedGist)}
                onStarToggle={() => handleStarToggle(selectedGist)}
              />
            )}
          </>
        )}

        {view === 'detail' && !selectedGist && (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState title="Gist not found" message="This gist may have been deleted." />
          </div>
        )}

        {view === 'create' && (
          <GistEditor
            gist={null}
            onSave={handleCreateGist}
            onCancel={() => setView('list')}
          />
        )}

        {view === 'edit' && selectedGist && (
          <GistEditor
            gist={selectedGist}
            onSave={handleUpdateGist}
            onCancel={() => setView('detail')}
          />
        )}
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <ConfirmDialog action={confirmAction} onClose={() => setConfirmAction(null)} />
    </div>
  );
}

interface GistListViewProps {
  gists: Gist[];
  loading: boolean;
  filter: GistFilter;
  search: string;
  sortBy: 'updated' | 'created' | 'name';
  onSortChange: (s: 'updated' | 'created' | 'name') => void;
  onGistClick: (g: Gist) => void;
  onStarToggle: (g: Gist) => void;
  starredIds: Set<string>;
  onNewGist: () => void;
}

function GistListView({
  gists,
  loading,
  filter,
  search,
  sortBy,
  onSortChange,
  onGistClick,
  onStarToggle,
  starredIds,
  onNewGist,
}: GistListViewProps) {
  const filterLabels: Record<GistFilter, string> = {
    all: 'All Gists',
    public: 'Public Gists',
    secret: 'Secret Gists',
    starred: 'Starred Gists',
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {filterLabels[filter]}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {gists.length} {gists.length === 1 ? 'gist' : 'gists'}
              {search && ` matching "${search}"`}
            </p>
          </div>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'updated' | 'created' | 'name')}
            className="rounded-lg border px-3 py-2 text-sm transition-sm"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="updated">Recently updated</option>
            <option value="created">Recently created</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <SkeletonGistList count={5} />
        ) : gists.length === 0 ? (
          <EmptyState
            icon={search ? 'search' : 'gists'}
            title={search ? 'No results found' : `No ${filter === 'all' ? '' : filter} gists yet`}
            message={
              search
                ? `No gists match "${search}". Try a different search term.`
                : filter === 'starred'
                  ? 'Star some gists to see them here.'
                  : 'Create your first gist to get started.'
            }
            action={
              !search && (
                <button
                  onClick={onNewGist}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-sm"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
                    color: 'var(--bg-primary)',
                  }}
                >
                  Create New Gist
                </button>
              )
            }
          />
        ) : (
          <div className="space-y-3">
            {gists.map((gist) => (
              <GistCard
                key={gist.id}
                gist={gist}
                isStarred={starredIds.has(gist.id)}
                onClick={() => onGistClick(gist)}
                onStarToggle={(e) => {
                  e.stopPropagation();
                  onStarToggle(gist);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
