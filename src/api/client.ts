import { getInitDataRaw } from '../telegram/init';
import type { DocumentChecklistItem, MeResponse, UploadResult, Client } from './types';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `tma ${getInitDataRaw()}`,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${path} failed: ${res.status} ${body}`);
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
