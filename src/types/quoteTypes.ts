
export interface Quote {
  id: string;
  user_id: string;
  client_id: string | null;
  quote_number: string;
  title: string;
  description: string | null;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  valid_until: string | null;
  subtotal: number;
  gst_rate: number;
  gst_amount: number;
  total_amount: number;
  terms_and_conditions: string | null;
  public_link_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteElement {
  id: string;
  quote_id: string;
  element_type: 'text' | 'image' | 'pricing_grid' | 'line_item' | 'spacer';
  content: Record<string, any>;
  position_order: number;
  created_at: string;
  updated_at: string;
}

export interface TextElementContent {
  text: string;
  fontSize?: 'small' | 'medium' | 'large' | 'xl';
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
}

export interface ImageElementContent {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  alignment?: 'left' | 'center' | 'right';
}

export interface LineItemContent {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface PricingGridContent {
  title?: string;
  columns: string[];
  rows: Array<{
    label: string;
    values: string[];
  }>;
}

export interface SpacerContent {
  height: number;
}
