import { getInitDataRaw } from '../telegram/init';
import type {
  AdminEvent,
  ClientSearchResult,
  ComplaintDepartment,
  ConferenceEvent,
  DeclarationResponse,
  DocumentChecklistItem,
  EventInvitee,
  EventType,
  MeResponse,
  UploadResult,
  Client,
} from './types';

// Strip a trailing slash regardless of how VITE_API_URL was entered
// (with or without one) — path always starts with '/', so a trailing
// slash here would produce a double-slash URL that FastAPI treats as a
// different, unmatched route (404).
const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

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

function postJson<T>(path: string, body: unknown, method = 'POST'): Promise<T> {
  return request<T>(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
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

  uploadTextDocument: (documentType: string, text: string) => {
    const form = new FormData();
    form.append('document_type', documentType);
    form.append('text', text);
    return request<UploadResult>('/api/documents/upload-text', { method: 'POST', body: form });
  },

  getComplaintDepartments: () => request<{ departments: ComplaintDepartment[] }>('/api/complaints/departments'),

  submitComplaint: (department: string, employeeName: string, text: string) => {
    const form = new FormData();
    form.append('department', department);
    form.append('employee_name', employeeName);
    form.append('text', text);
    return request<{ ok: true; task_id: number }>('/api/complaints', { method: 'POST', body: form });
  },

  uploadReceipt: (invoiceId: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<{ ok: true }>(`/api/payments/${invoiceId}/receipt`, { method: 'POST', body: form });
  },

  submitScreening: (answers: ScreeningAnswers) => {
    const form = new FormData();
    form.append('has_gambling_crypto', String(answers.hasGamblingCrypto));
    form.append('is_fraud_victim', String(answers.isFraudVictim));
    form.append('has_sold_property', String(answers.hasSoldProperty));
    form.append('income_over_30k', String(answers.incomeOver30k));
    return request<{ ok: true }>('/api/screening', { method: 'POST', body: form });
  },

  registerAdmin: (code: string) => {
    const form = new FormData();
    form.append('code', code);
    return request<{ ok: true }>('/api/admin/register', { method: 'POST', body: form });
  },

  getDeclaration: () => request<DeclarationResponse>('/api/declaration'),

  submitDeclaration: (answers: Record<string, string>) => postJson<{ ok: true }>('/api/declaration', answers),

  // ---- Зустрічі (conferences) — client-facing ----

  getConferences: () => request<{ events: ConferenceEvent[] }>('/api/conferences'),

  submitConferenceRsvp: (eventId: number, rsvp: 'going' | 'declined') =>
    postJson<{ ok: true }>(`/api/conferences/${eventId}/rsvp`, { rsvp }),

  submitConferenceFeedback: (eventId: number, stars: number, comment: string) =>
    postJson<{ ok: true }>(`/api/conferences/${eventId}/feedback`, { stars, comment: comment || null }),

  // ---- Зустрічі — admin panel ----

  adminListEventTypes: () => request<{ types: EventType[] }>('/api/admin/conferences/types'),

  adminListEvents: (upcoming: boolean) =>
    request<{ events: AdminEvent[] }>(`/api/admin/conferences/events?upcoming=${upcoming}`),

  adminGetEvent: (eventId: number) =>
    request<{ event: AdminEvent; invitees: EventInvitee[] }>(`/api/admin/conferences/events/${eventId}`),

  adminCreateEvent: (fields: {
    type_code: number | null;
    title: string;
    description?: string;
    start_at: string;
    duration_min: number;
    format: string;
    link?: string;
    person_name?: string;
    person_role?: string;
    client_ids?: number[];
  }) => postJson<{ ok: true; event_id: number }>('/api/admin/conferences/events', fields),

  adminUpdateEvent: (eventId: number, field: string, value: string) =>
    postJson<{ ok: true }>(`/api/admin/conferences/events/${eventId}`, { field, value }, 'PATCH'),

  adminCancelEvent: (eventId: number) => request<{ ok: true }>(`/api/admin/conferences/events/${eventId}`, { method: 'DELETE' }),

  adminSearchClients: (q: string) =>
    request<{ clients: ClientSearchResult[] }>(`/api/admin/conferences/clients/search?q=${encodeURIComponent(q)}`),

  adminInviteClients: (eventId: number, clientIds: number[]) =>
    postJson<{ ok: true }>(`/api/admin/conferences/events/${eventId}/invite`, { client_ids: clientIds }),

  adminMarkAttendance: (eventId: number, clientId: number, attended: boolean) =>
    postJson<{ ok: true }>(`/api/admin/conferences/events/${eventId}/attendance`, { client_id: clientId, attended }),
};

export interface ScreeningAnswers {
  hasGamblingCrypto: boolean;
  isFraudVictim: boolean;
  hasSoldProperty: boolean;
  incomeOver30k: boolean;
}
