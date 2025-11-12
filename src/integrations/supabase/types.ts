export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      campaign_sends: {
        Row: {
          campaign_id: string
          clicked_at: string | null
          contact_id: string
          created_at: string
          delivered_at: string | null
          email_address: string
          error_message: string | null
          id: string
          opened_at: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          campaign_id: string
          clicked_at?: string | null
          contact_id: string
          created_at?: string
          delivered_at?: string | null
          email_address: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          campaign_id?: string
          clicked_at?: string | null
          contact_id?: string
          created_at?: string
          delivered_at?: string | null
          email_address?: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      checklist_templates: {
        Row: {
          created_at: string
          id: string
          items: Json
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          items: Json
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_checklists: {
        Row: {
          client_id: string
          completed_at: string | null
          completed_items: Json
          created_at: string
          id: string
          status: string
          template_id: string
          template_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          completed_items?: Json
          created_at?: string
          id?: string
          status?: string
          template_id: string
          template_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          completed_items?: Json
          created_at?: string
          id?: string
          status?: string
          template_id?: string
          template_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_checklists_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_checklists_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          avatar: string | null
          company: string
          created_at: string
          gradient: string | null
          id: string
          industry: string | null
          joined_date: string
          phone: string | null
          projects_count: number | null
          status: string
          total_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar?: string | null
          company: string
          created_at?: string
          gradient?: string | null
          id?: string
          industry?: string | null
          joined_date?: string
          phone?: string | null
          projects_count?: number | null
          status?: string
          total_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar?: string | null
          company?: string
          created_at?: string
          gradient?: string | null
          id?: string
          industry?: string | null
          joined_date?: string
          phone?: string | null
          projects_count?: number | null
          status?: string
          total_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          address_line3: string | null
          bank_account: string | null
          bank_details: string | null
          company_name: string
          created_at: string
          gst_number: string | null
          id: string
          logo_base64: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          address_line3?: string | null
          bank_account?: string | null
          bank_details?: string | null
          company_name?: string
          created_at?: string
          gst_number?: string | null
          id?: string
          logo_base64?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          address_line3?: string | null
          bank_account?: string | null
          bank_details?: string | null
          company_name?: string
          created_at?: string
          gst_number?: string | null
          id?: string
          logo_base64?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          client_id: string
          created_at: string
          email: string
          email_subscribed: boolean
          id: string
          is_primary: boolean
          name: string
          phone: string | null
          role: string | null
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          email: string
          email_subscribed?: boolean
          id?: string
          is_primary?: boolean
          name: string
          phone?: string | null
          role?: string | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          email?: string
          email_subscribed?: boolean
          id?: string
          is_primary?: boolean
          name?: string
          phone?: string | null
          role?: string | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          client_id: string
          client_managed: boolean
          created_at: string
          expiry_date: string
          id: string
          name: string
          notes: string | null
          registrar: string
          renewal_cost: number
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          client_managed?: boolean
          created_at?: string
          expiry_date: string
          id?: string
          name: string
          notes?: string | null
          registrar: string
          renewal_cost?: number
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          client_managed?: boolean
          created_at?: string
          expiry_date?: string
          id?: string
          name?: string
          notes?: string | null
          registrar?: string
          renewal_cost?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "domains_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          clicked_count: number | null
          content_html: string
          content_json: Json | null
          created_at: string
          delivered_count: number | null
          id: string
          name: string
          opened_count: number | null
          recipient_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clicked_count?: number | null
          content_html: string
          content_json?: Json | null
          created_at?: string
          delivered_count?: number | null
          id?: string
          name: string
          opened_count?: number | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clicked_count?: number | null
          content_html?: string
          content_json?: Json | null
          created_at?: string
          delivered_count?: number | null
          id?: string
          name?: string
          opened_count?: number | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_images: {
        Row: {
          alt_text: string | null
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          invoice_id: string
          recipient_email: string
          sent_at: string
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          invoice_id: string
          recipient_email: string
          sent_at?: string
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          invoice_id?: string
          recipient_email?: string
          sent_at?: string
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          content_html: string
          content_json: Json | null
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          thumbnail_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content_html: string
          content_json?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content_html?: string
          content_json?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hosting: {
        Row: {
          client_id: string
          created_at: string
          id: string
          login_url: string | null
          notes: string | null
          plan: string
          platform: string
          provider: string
          renewal_cost: number | null
          renewal_date: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          login_url?: string | null
          notes?: string | null
          plan: string
          platform?: string
          provider: string
          renewal_cost?: number | null
          renewal_date?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          login_url?: string | null
          notes?: string | null
          plan?: string
          platform?: string
          provider?: string
          renewal_cost?: number | null
          renewal_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hosting_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          content: string | null
          created_at: string
          id: string
          priority: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          priority?: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          priority?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          rate: number
        }
        Insert: {
          amount?: number
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          rate?: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string | null
          payment_method: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          balance_due: number | null
          client_id: string
          created_at: string
          deposit_amount: number | null
          deposit_percentage: number | null
          description: string | null
          due_date: string | null
          gst_amount: number | null
          gst_rate: number | null
          id: string
          invoice_number: string
          issued_date: string | null
          last_emailed_at: string | null
          paid_date: string | null
          project_id: string | null
          status: string
          subtotal: number
          subtotal_incl_gst: number | null
          title: string
          total_amount: number
          updated_at: string
          user_id: string
          xero_invoice_id: string | null
        }
        Insert: {
          balance_due?: number | null
          client_id: string
          created_at?: string
          deposit_amount?: number | null
          deposit_percentage?: number | null
          description?: string | null
          due_date?: string | null
          gst_amount?: number | null
          gst_rate?: number | null
          id?: string
          invoice_number: string
          issued_date?: string | null
          last_emailed_at?: string | null
          paid_date?: string | null
          project_id?: string | null
          status?: string
          subtotal?: number
          subtotal_incl_gst?: number | null
          title: string
          total_amount?: number
          updated_at?: string
          user_id: string
          xero_invoice_id?: string | null
        }
        Update: {
          balance_due?: number | null
          client_id?: string
          created_at?: string
          deposit_amount?: number | null
          deposit_percentage?: number | null
          description?: string | null
          due_date?: string | null
          gst_amount?: number | null
          gst_rate?: number | null
          id?: string
          invoice_number?: string
          issued_date?: string | null
          last_emailed_at?: string | null
          paid_date?: string | null
          project_id?: string | null
          status?: string
          subtotal?: number
          subtotal_incl_gst?: number | null
          title?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
          xero_invoice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_team_members: {
        Row: {
          assigned_at: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_project_team_members_project_id"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          client_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_billable: boolean
          is_retainer: boolean
          name: string
          priority: string
          progress: number | null
          start_date: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: number | null
          client_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_billable?: boolean
          is_retainer?: boolean
          name: string
          priority?: string
          progress?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: number | null
          client_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_billable?: boolean
          is_retainer?: boolean
          name?: string
          priority?: string
          progress?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      task_files: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_files_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_planning: {
        Row: {
          allocated_minutes: number
          created_at: string
          id: string
          is_scheduled: boolean
          order_index: number
          scheduled_date: string
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allocated_minutes?: number
          created_at?: string
          id?: string
          is_scheduled?: boolean
          order_index?: number
          scheduled_date?: string
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allocated_minutes?: number
          created_at?: string
          id?: string
          is_scheduled?: boolean
          order_index?: number
          scheduled_date?: string
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_planning_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee: string | null
          client_id: string | null
          created_at: string
          description: string | null
          dropbox_url: string | null
          due_date: string | null
          id: string
          notes: string | null
          progress: number | null
          project: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assignee?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          dropbox_url?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          progress?: number | null
          project?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assignee?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          dropbox_url?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          progress?: number | null
          project?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          created_at: string
          date: string
          description: string
          hours: number
          id: string
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          description: string
          hours: number
          id?: string
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string
          hours?: number
          id?: string
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_time_entries_task_id"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      time_slots: {
        Row: {
          color: string | null
          created_at: string
          date: string
          id: string
          task_id: string | null
          task_type: string | null
          time_slot: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          date: string
          id?: string
          task_id?: string | null
          task_type?: string | null
          time_slot: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          date?: string
          id?: string
          task_id?: string | null
          task_type?: string | null
          time_slot?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      xero_oauth_states: {
        Row: {
          created_at: string
          id: string
          state: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          state: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      xero_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          refresh_token: string
          tenant_id: string
          tenant_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          refresh_token: string
          tenant_id: string
          tenant_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          refresh_token?: string
          tenant_id?: string
          tenant_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
