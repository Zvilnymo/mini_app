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

export interface DeclarationResponse {
  questions: DeclarationQuestion[];
  answers: Record<string, string>;
  completed: boolean;
}
