
export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  project_id?: string;
  invoice_number: string;
  title: string;
  description?: string;
  subtotal: number;
  gst_rate: number;
  gst_mode?: 'standard' | 'zero_rated';
  gst_amount: number;
  subtotal_incl_gst: number;
  total_amount: number;
  deposit_percentage: number;
  deposit_amount: number;
  balance_due: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date?: string;
  issued_date?: string;
  paid_date?: string;
  last_emailed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  created_at: string;
}

export interface InvoicePayment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date?: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
}
