
import { Database } from '@/integrations/supabase/types';

// Extract the exact Supabase table types
export type SupabaseQuote = Database['public']['Tables']['quotes']['Row'];
export type SupabaseQuoteInsert = Database['public']['Tables']['quotes']['Insert'];
export type SupabaseQuoteUpdate = Database['public']['Tables']['quotes']['Update'];

export type SupabaseQuoteElement = Database['public']['Tables']['quote_elements']['Row'];
export type SupabaseQuoteElementInsert = Database['public']['Tables']['quote_elements']['Insert'];
export type SupabaseQuoteElementUpdate = Database['public']['Tables']['quote_elements']['Update'];

// Create safe insert types that work with our database triggers
export type QuoteInsertData = Omit<SupabaseQuoteInsert, 'quote_number' | 'id' | 'created_at' | 'updated_at' | 'public_link_token'> & {
  quote_number?: string; // Make optional since it's auto-generated
  public_link_token?: string; // Make optional since it's auto-generated
};

export type QuoteElementInsertData = Omit<SupabaseQuoteElementInsert, 'id' | 'created_at' | 'updated_at'>;
