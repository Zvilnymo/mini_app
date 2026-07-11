import { getInitDataRaw } from '../telegram/init';
import type { DocumentChecklistItem, MeResponse, UploadResult, Client } from './types';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE_URL) {
    // Fails loudly instead of silently falling back to a relative (wrong)
    // origin — this build was published without VITE_API_URL set.
    throw new Error(`VITE_API_URL is not set in this build (requested ${path})`);
  }
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `tma ${getInitDataRaw()}`,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    // Report the actual resolved URL, not just the intended path — if
    // VITE_API_URL didn't make it into this build, BASE_URL is empty and
    // the real request silently goes to a relative (wrong) origin instead.
    throw new Error(`${res.status} ${url} -> ${body}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  me: () => request<MeResponse>('/api/me'),

  register: (phone: string) => {
    const form = new FormData();
    form.append('phone', phone);
    return request<{ registered: true; client: Client }>('/api/register', { method: 'POST', body: form });
  },

  documents: () => request<{ documents: DocumentChecklistItem[] }>('/api/documents'),

  uploadDocument: (documentType: string, file: File) => {
    const form = new FormData();
    form.append('document_type', documentType);
    form.append('file', file);
    return request<UploadResult>('/api/documents/upload', { method: 'POST', body: form });
  },

  submitComplaint: (text: string) => {
    const form = new FormData();
    form.append('text', text);
    return request<{ ok: true; task_id: number }>('/api/complaints', { method: 'POST', body: form });
  },
};
