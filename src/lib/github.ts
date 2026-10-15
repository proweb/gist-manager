import type {
  Gist,
  GitHubUser,
  CreateGistPayload,
  UpdateGistPayload,
} from '@/types';

const API_BASE = 'https://api.github.com';

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `GitHub API error (${res.status})`;
    try {
      const body = await res.json();
      if (body.message) message = body.message;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function fetchUser(token: string): Promise<GitHubUser> {
  const res = await fetch(`${API_BASE}/user`, { headers: headers(token) });
  return handleResponse<GitHubUser>(res);
}

export async function fetchGists(token: string): Promise<Gist[]> {
  const res = await fetch(`${API_BASE}/gists?per_page=100`, {
    headers: headers(token),
  });
  return handleResponse<Gist[]>(res);
}

export async function fetchStarredGists(token: string): Promise<Gist[]> {
  const res = await fetch(`${API_BASE}/gists/starred?per_page=100`, {
    headers: headers(token),
  });
  return handleResponse<Gist[]>(res);
}

export async function fetchGist(
  token: string,
  id: string
): Promise<Gist> {
  const res = await fetch(`${API_BASE}/gists/${id}`, {
    headers: headers(token),
  });
  return handleResponse<Gist>(res);
}

export async function createGist(
  token: string,
  payload: CreateGistPayload
): Promise<Gist> {
  const res = await fetch(`${API_BASE}/gists`, {
    method: 'POST',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<Gist>(res);
}

export async function updateGist(
  token: string,
  id: string,
  payload: UpdateGistPayload
): Promise<Gist> {
  const res = await fetch(`${API_BASE}/gists/${id}`, {
    method: 'PATCH',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<Gist>(res);
}

export async function deleteGist(
  token: string,
  id: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/gists/${id}`, {
    method: 'DELETE',
    headers: headers(token),
  });
  await handleResponse<void>(res);
}

export async function starGist(
  token: string,
  id: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/gists/${id}/star`, {
    method: 'PUT',
    headers: { ...headers(token), 'Content-Length': '0' },
  });
  await handleResponse<void>(res);
}

export async function unstarGist(
  token: string,
  id: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/gists/${id}/star`, {
    method: 'DELETE',
    headers: headers(token),
  });
  await handleResponse<void>(res);
}

export async function isGistStarred(
  token: string,
  id: string
): Promise<boolean> {
  const res = await fetch(`${API_BASE}/gists/${id}/star`, {
    headers: headers(token),
  });
  return res.status === 204;
}
