import type { LostOrFoundItem, ModerationItem, AppUser, ActivityLog, AppStats, ContactMessage } from './types';

const BASE = '/equipo_02/api';

async function extractError(res: Response, method: string, path: string): Promise<never> {
  const data = await res.json().catch(() => ({}));
  throw new Error((data as { error?: string }).error || `${method} ${path} → HTTP ${res.status}`);
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) return extractError(res, 'GET', path);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return extractError(res, 'POST', path);
  return res.json();
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return extractError(res, 'PUT', path);
  return res.json();
}

async function del<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE' });
  if (!res.ok) return extractError(res, 'DELETE', path);
  return res.json();
}

export const api = {
  items: {
    list: () => get<LostOrFoundItem[]>('/items'),
  },

  moderation: {
    list:    ()                          => get<ModerationItem[]>('/moderation'),
    submit:  (item: Partial<LostOrFoundItem>) => post<{ id: string }>('/moderation', item),
    approve: (id: string)                => post<{ ok: boolean }>(`/moderation/${id}/approve`, {}),
    reject:  (id: string)                => del<{ ok: boolean }>(`/moderation/${id}`),
  },

  users: {
    list:         ()               => get<AppUser[]>('/users'),
    create:       (u: AppUser)     => post<{ id: string }>('/users', u),
    toggleStatus: (id: string)     => put<{ status: string }>(`/users/${id}/toggle-status`, {}),
  },

  logs: {
    list:   ()                    => get<ActivityLog[]>('/logs'),
    create: (log: ActivityLog)    => post<{ id: string }>('/logs', log),
  },

  auth: {
    login: (email: string, password: string) =>
      post<{ name: string; email: string; role: string }>('/auth/login', { email, password }),
    register: (name: string, email: string, password: string) =>
      post<{ name: string; email: string; role: string }>('/auth/register', { name, email, password }),
  },

  contact: {
    send: (data: { name: string; email: string; subject: string; message: string; item_id?: string; finder_email?: string }) =>
      post<{ id: string; ok: boolean }>('/contact', data),
    list:      ()              => get<ContactMessage[]>('/contact'),
    myClaims:   (email: string) => get<ContactMessage[]>(`/contact/my-claims?email=${encodeURIComponent(email)}`),
    foundForMe: (email: string) => get<ContactMessage[]>(`/contact/found-for-me?email=${encodeURIComponent(email)}`),
    approve:         (id: string)                        => post<{ ok: boolean }>(`/contact/${id}/approve`, {}),
    reject:          (id: string)                        => post<{ ok: boolean }>(`/contact/${id}/reject`, {}),
    confirmDelivery: (id: string, role: 'owner' | 'finder') => post<{ ok: boolean; both_confirmed: boolean }>(`/contact/${id}/confirm`, { role }),
  },

  stats: {
    summary:  () => get<AppStats>('/stats'),
    category: () => get<{ name: string; value: number }[]>('/stats/category'),
    weekly:   () => get<{ week: string; reportes: number; recuperados: number }[]>('/stats/weekly'),
    monthly:  () => get<{ month: string; volumen: number }[]>('/stats/monthly'),
  },

  upload: {
    image: async (file: File): Promise<{ url: string }> => {
      const form = new FormData();
      form.append('image', file);
      const res = await fetch(`${BASE}/upload`, { method: 'POST', body: form });
      if (!res.ok) return extractError(res, 'POST', '/upload');
      return res.json();
    },
  },
};
