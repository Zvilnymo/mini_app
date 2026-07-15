export interface Client {
  id: number;
  full_name: string;
  phone: string;
}

export interface CaseStatus {
  step: number;
  step_label: string;
  steps: string[];
  current_stage_name: string | null;
}

export interface Invoice {
  id: number;
  title: string | null;
  amount: string | null;
  stage_id: string;
  stage_name: string | null;
  payment_date: string | null;
  invoice_date: string | null;
  receipt_pending: boolean;
}

export interface Payments {
  invoices: Invoice[];
  paid_total: number;
  unpaid_total: number;
}

export interface DebtOverview {
  total_debt: number;
  to_be_written_off: number;
  creditors_count: number | null;
  banks_count: number | null;
}

export type MeResponse =
  | { registered: false }
  | {
      registered: true;
      screening_completed: boolean;
      client: Client;
      case: CaseStatus | null;
      payments: Payments | null;
      debt_overview: DebtOverview | null;
      lead_debt: number | null;
      days_active: number | null;
      docs_ready: number;
      docs_total: number;
    };

export interface DocumentChecklistItem {
  type: string;
  name: string;
  emoji: string;
  required: boolean;
  uploadable: boolean;
  text_input: boolean;
  multiple: boolean;
  uploaded_count: number;
  latest_status: 'accepted' | 'rejected' | 'uncertain' | 'pending' | null;
}

export interface UploadResult {
  validation_status: string | null;
  document: {
    id: number;
    document_type: string;
    file_name: string;
    drive_file_url: string | null;
  };
}

export interface DeclarationQuestion {
  key: string;
  emoji: string;
  question: string;
  hint?: string;
  required: boolean;
}

export interface ComplaintDepartment {
  key: string;
  name: string;
}

export interface DeclarationResponse {
  questions: DeclarationQuestion[];
  answers: Record<string, string>;
  completed: boolean;
}

export type ConferenceFormat = 'video' | 'phone' | 'office';
export type ConferenceRsvp = '' | 'going' | 'declined';

export interface ConferenceEvent {
  event_id: number;
  title: string;
  description: string | null;
  start_at: string;
  duration_min: number;
  format: ConferenceFormat;
  link: string | null;
  person_name: string | null;
  person_role: string | null;
  rsvp: ConferenceRsvp;
  rsvp_at: string | null;
  attended: boolean | null;
  feedback_stars: number | null;
  feedback_comment: string | null;
}

export interface EventType {
  type_code: number;
  title: string;
  description: string | null;
  active: boolean;
  required: boolean;
}

export interface ConferenceChecklistItem {
  type_code: number;
  title: string;
  description: string | null;
  completed: boolean;
}

export interface EventInvitee {
  client_id: number;
  full_name: string;
  phone: string;
  rsvp: ConferenceRsvp;
  rsvp_at: string | null;
}

export interface AdminEvent {
  event_id: number;
  type_code: number | null;
  title: string;
  description: string | null;
  start_at: string;
  duration_min: number;
  format: ConferenceFormat;
  link: string | null;
  person_name: string | null;
  person_role: string | null;
  created_by: number;
  created_at: string;
}

export interface ClientSearchResult {
  id: number;
  full_name: string;
  phone: string;
  telegram_id: number | null;
}
