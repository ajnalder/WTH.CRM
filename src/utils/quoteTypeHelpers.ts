
import { Quote, QuoteElement } from '@/types/quoteTypes';
import { SupabaseQuote, SupabaseQuoteElement } from '@/types/supabaseQuoteTypes';
import { validateRequiredString, validateCurrency, validatePositiveNumber } from '@/utils/validation';

// Type guards to safely validate data
export const isValidQuoteStatus = (status: string): status is Quote['status'] => {
  return ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'].includes(status);
};

export const isValidElementType = (type: string): type is QuoteElement['element_type'] => {
  return ['text', 'image', 'pricing_grid', 'line_item', 'spacer'].includes(type);
};

// Transform Supabase data to application types with validation
export const transformSupabaseQuote = (supabaseQuote: SupabaseQuote & { clients?: any }): Quote => {
  // Validate required fields
  if (!validateRequiredString(supabaseQuote.title)) {
    throw new Error('Invalid quote: title is required');
  }
  
  if (!validateRequiredString(supabaseQuote.quote_number)) {
    throw new Error('Invalid quote: quote_number is required');
  }

  if (!isValidQuoteStatus(supabaseQuote.status)) {
    throw new Error(`Invalid quote status: ${supabaseQuote.status}`);
  }

  if (!validateCurrency(supabaseQuote.subtotal) || 
      !validateCurrency(supabaseQuote.gst_amount) || 
      !validateCurrency(supabaseQuote.total_amount)) {
    throw new Error('Invalid quote: invalid currency values');
  }

  return {
    id: supabaseQuote.id,
    user_id: supabaseQuote.user_id,
    client_id: supabaseQuote.client_id,
    quote_number: supabaseQuote.quote_number,
    title: supabaseQuote.title,
    description: supabaseQuote.description,
    status: supabaseQuote.status as Quote['status'],
    valid_until: supabaseQuote.valid_until,
    subtotal: supabaseQuote.subtotal,
    gst_rate: supabaseQuote.gst_rate,
    gst_amount: supabaseQuote.gst_amount,
    total_amount: supabaseQuote.total_amount,
    terms_and_conditions: supabaseQuote.terms_and_conditions,
    public_link_token: supabaseQuote.public_link_token,
    created_at: supabaseQuote.created_at,
    updated_at: supabaseQuote.updated_at,
    clients: supabaseQuote.clients
  };
};

export const transformSupabaseQuoteElement = (supabaseElement: SupabaseQuoteElement): QuoteElement => {
  if (!isValidElementType(supabaseElement.element_type)) {
    throw new Error(`Invalid element type: ${supabaseElement.element_type}`);
  }

  if (!validatePositiveNumber(supabaseElement.position_order, 9999)) {
    throw new Error('Invalid element: position_order must be a positive number');
  }

  return {
    id: supabaseElement.id,
    quote_id: supabaseElement.quote_id,
    element_type: supabaseElement.element_type as QuoteElement['element_type'],
    content: supabaseElement.content as Record<string, any>,
    position_order: supabaseElement.position_order,
    created_at: supabaseElement.created_at,
    updated_at: supabaseElement.updated_at
  };
};

// Prepare data for database insertion
export const prepareQuoteForInsert = (quoteData: Partial<Quote>, userId: string): QuoteInsertData => {
  if (!validateRequiredString(quoteData.title || '')) {
    throw new Error('Title is required');
  }

  return {
    title: quoteData.title!,
    description: quoteData.description || null,
    client_id: quoteData.client_id || null,
    valid_until: quoteData.valid_until || null,
    terms_and_conditions: quoteData.terms_and_conditions || null,
    user_id: userId,
    status: 'draft',
    subtotal: 0,
    gst_rate: 15.00,
    gst_amount: 0,
    total_amount: 0
  };
};
