
export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  items: ChecklistItem[];
  created_at: string;
  updated_at: string;
}

export interface ClientChecklist {
  id: string;
  user_id: string;
  client_id: string;
  template_id: string;
  template_name: string;
  status: 'in_progress' | 'completed';
  completed_items: string[];
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientChecklistWithClient extends ClientChecklist {
  client: {
    id: string;
    company: string;
    name: string;
  };
}
