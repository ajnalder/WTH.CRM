export interface Quote {
  id: string;
  user_id: string;
  client_id: string;
  quote_number: string;
  title: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired';
  valid_until?: string;
  total_amount: number;
  deposit_percentage: number;
  project_type?: string;
  accepted_at?: string;
  accepted_by_name?: string;
  viewed_at?: string;
  public_token: string;
  creator_name?: string;
  contact_name?: string;
  contact_email?: string;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
  clients?: {
    id: string;
    company: string;
  };
}

export interface QuoteBlock {
  id: string;
  quote_id: string;
  block_type: 'text' | 'image' | 'pricing_table' | 'terms';
  title?: string;
  content?: string;
  image_url?: string;
  order_index: number;
  created_at: string;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  is_optional: boolean;
  order_index: number;
  created_at: string;
}

export interface QuoteTemplate {
  id: string;
  user_id: string;
  name: string;
  block_type: string;
  content?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuoteEvent {
  id: string;
  quote_id: string;
  event_type: 'sent' | 'opened' | 'accepted' | 'declined';
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
