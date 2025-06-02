export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          avatar: string | null
          company: string
          created_at: string
          email: string
          gradient: string | null
          id: string
          industry: string | null
          joined_date: string
          name: string
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
          email: string
          gradient?: string | null
          id?: string
          industry?: string | null
          joined_date?: string
          name: string
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
          email?: string
          gradient?: string | null
          id?: string
          industry?: string | null
          joined_date?: string
          name?: string
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
          id: string
          is_primary: boolean
          name: string
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          email: string
          id?: string
          is_primary?: boolean
          name: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          email?: string
          id?: string
          is_primary?: boolean
          name?: string
          phone?: string | null
          role?: string | null
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
          created_at: string
          expiry_date: string
          id: string
          name: string
          registrar: string
          renewal_cost: number
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          expiry_date: string
          id?: string
          name: string
          registrar: string
          renewal_cost?: number
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          expiry_date?: string
          id?: string
          name?: string
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
      tasks: {
        Row: {
          assignee: string | null
          created_at: string
          description: string | null
          dropbox_url: string | null
          due_date: string | null
          id: string
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
          created_at?: string
          description?: string | null
          dropbox_url?: string | null
          due_date?: string | null
          id?: string
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
          created_at?: string
          description?: string | null
          dropbox_url?: string | null
          due_date?: string | null
          id?: string
          progress?: number | null
          project?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
