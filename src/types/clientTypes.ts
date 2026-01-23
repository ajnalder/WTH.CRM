
export interface Client {
  id: string;
  user_id: string;
  company: string;
  phone: string | null;
  description: string | null;
  status: 'active' | 'pending' | 'inactive';
  projects_count: number;
  total_value: number;
  joined_date: string;
  avatar: string | null;
  gradient: string | null;
  created_at: string;
  updated_at: string;
  klaviyo_from_email?: string | null;
  klaviyo_from_label?: string | null;
  klaviyo_default_audience_id?: string | null;
  klaviyo_audiences?: { id: string; label?: string }[] | null;
  klaviyo_placed_order_metric_id?: string | null;
  klaviyo_template_id?: string | null;
  shopify_domain?: string | null;
  shopify_admin_access_token?: string | null;
  shopify_last_synced_at?: string | null;
  shopify_sync_status?: string | null;
  shopify_sync_error?: string | null;
  shopify_product_count?: number | null;
}

export interface CreateClientData {
  company: string;
  phone: string;
  description: string;
}
