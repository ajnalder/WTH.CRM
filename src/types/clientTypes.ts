
export interface Client {
  id: string;
  user_id: string;
  company: string;
  phone: string | null;
  industry: string | null;
  status: 'active' | 'pending' | 'inactive';
  projects_count: number;
  total_value: number;
  joined_date: string;
  avatar: string | null;
  gradient: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateClientData {
  company: string;
  phone: string;
  industry: string;
}
