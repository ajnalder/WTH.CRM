
export interface Project {
  id: string;
  client_id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  start_date: string | null;
  due_date: string | null;
  budget: number | null;
  progress: number;
  is_retainer: boolean;
  is_billable: boolean;
  created_at: string;
  updated_at: string;
  client_name?: string;
  team_members?: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
    avatar: string;
    gradient: string;
  }>;
}

export interface CreateProjectData {
  client_id: string;
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  start_date?: string;
  due_date?: string | null;
  budget?: number;
  progress?: number;
  is_retainer?: boolean;
  is_billable?: boolean;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: string;
  priority?: string;
  start_date?: string;
  due_date?: string;
  budget?: number;
  progress?: number;
  is_retainer?: boolean;
  is_billable?: boolean;
}
