import { useState } from 'react';
import { KeyRound, ExternalLink, Eye, EyeOff, Loader2, FileCode2 } from 'lucide-react';

interface AuthScreenProps {
  onAuthenticate: (token: string) => Promise<boolean>;
}

export function AuthScreen({ onAuthenticate }: AuthScreenProps) {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please enter a personal access token');
      return;
    }
    setError('');
    setLoading(true);
    const success = await onAuthenticate(token.trim());
    if (!success) {
      setError('Invalid token. Make sure your token has the "gist" scope.');
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `radial-gradient(ellipse at top, var(--bg-secondary), var(--bg-primary))`,
      }}
    >
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
              boxShadow: '0 0 40px var(--accent-glow)',
            }}
          >
            <FileCode2 size={32} style={{ color: 'var(--bg-primary)' }} />
          </div>
          <h1 className="text-2xl font-bold">
            <span className="gradient-text">GistHub</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Manage your GitHub gists with ease
          </p>
        </div>

        {/* Form card */}
        <div
          className="rounded-2xl border p-6 shadow-2xl"
          style={{
            borderColor: 'var(--border-bright)',
            background: 'var(--bg-elevated)',
          }}
        >
          <form onSubmit={handleSubmit}>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Personal Access Token
            </label>
            <div className="relative">
              <KeyRound
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                autoFocus
                className="w-full rounded-xl border pl-10 pr-10 py-3 text-sm transition-sm"
                style={{
                  borderColor: error ? 'var(--danger)' : 'var(--border)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-sm opacity-50 hover:opacity-100"
                style={{ color: 'var(--text-secondary)' }}
              >
                {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <p
                className="text-xs mt-2 px-3 py-2 rounded-lg animate-fade-in"
                style={{
                  color: 'var(--danger)',
                  background: 'rgba(239, 68, 68, 0.1)',
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 rounded-xl py-3 text-sm font-semibold transition-sm flex items-center justify-center gap-2 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
                color: 'var(--bg-primary)',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" />
                  Connecting...
                </>
              ) : (
                'Connect to GitHub'
              )}
            </button>
          </form>

          <div
            className="mt-5 pt-5 border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Need a token?{' '}
              <a
                href="https://github.com/settings/tokens/new?scopes=gist&description=GistHub"
                target="_blank"
                rel="noopener noreferrer"
                className="link-hover inline-flex items-center gap-0.5 font-medium"
                style={{ color: 'var(--accent)' }}
              >
                Create one on GitHub
                <ExternalLink size={11} />
              </a>
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              Your token is stored locally in your browser and never sent to any server except GitHub.
            </p>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          GistHub is not affiliated with GitHub. Powered by the GitHub REST API.
        </p>
      </div>
    </div>
  );
}
