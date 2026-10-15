export interface GistFile {
  filename: string;
  language: string | null;
  raw_url: string;
  size: number;
  content?: string;
  truncated?: boolean;
}

export interface GistOwner {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface Gist {
  id: string;
  description: string | null;
  public: boolean;
  created_at: string;
  updated_at: string;
  files: Record<string, GistFile>;
  owner: GistOwner;
  comments: number;
  html_url: string;
  git_pull_url: string;
  git_push_url: string;
  _starred?: boolean;
}

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
}

export type GistFilter = 'all' | 'public' | 'secret' | 'starred';

export type View = 'list' | 'detail' | 'create' | 'edit';

export interface GistFileInput {
  filename: string;
  content: string;
}

export interface CreateGistPayload {
  description: string;
  public: boolean;
  files: Record<string, { content: string }>;
}

export interface UpdateGistPayload {
  description?: string;
  files?: Record<string, { content?: string; filename?: string } | null>;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface ConfirmAction {
  title: string;
  message: string;
  confirmLabel: string;
  danger: boolean;
  onConfirm: () => void;
}
