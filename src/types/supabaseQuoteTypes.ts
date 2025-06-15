
import { Database } from '@/integrations/supabase/types';

// Extract the exact Supabase table types
export type SupabaseQuote = Database['public']['Tables']['quotes']['Row'];
export type SupabaseQuoteInsert = Database['public']['Tables']['quotes']['Insert'];
export type SupabaseQuoteUpdate = Database['public']['Tables']['quotes']['Update'];

export type SupabaseQuoteElement = Database['public']['Tables']['quote_elements']['Row'];
export type SupabaseQuoteElementInsert = Database['public']['Tables']['quote_elements']['Insert'];
export type SupabaseQuoteElementUpdate = Database['public']['Tables']['quote_elements']['Update'];

// Create safe insert types that work with our database triggers
// We'll use the exact Supabase insert type but omit auto-generated fields
export type QuoteInsertData = Omit<SupabaseQuoteInsert, 'id' | 'created_at' | 'updated_at'>;

export type QuoteElementInsertData = Omit<SupabaseQuoteElementInsert, 'id' | 'created_at' | 'updated_at'>;
