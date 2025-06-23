
-- Create table for storing Xero OAuth tokens and tenant information
CREATE TABLE public.xero_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  tenant_id TEXT NOT NULL,
  tenant_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id) -- Each user can only have one Xero connection
);

-- Create table for managing OAuth state validation
CREATE TABLE public.xero_oauth_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, state)
);

-- Add Row Level Security (RLS) to ensure users can only access their own tokens
ALTER TABLE public.xero_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xero_oauth_states ENABLE ROW LEVEL SECURITY;

-- Create policies for xero_tokens
CREATE POLICY "Users can view their own Xero tokens" 
  ON public.xero_tokens 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own Xero tokens" 
  ON public.xero_tokens 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Xero tokens" 
  ON public.xero_tokens 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Xero tokens" 
  ON public.xero_tokens 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for xero_oauth_states
CREATE POLICY "Users can view their own OAuth states" 
  ON public.xero_oauth_states 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own OAuth states" 
  ON public.xero_oauth_states 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own OAuth states" 
  ON public.xero_oauth_states 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add xero_invoice_id column to invoices table to track synced invoices
ALTER TABLE public.invoices 
ADD COLUMN xero_invoice_id TEXT;

-- Create index for faster lookups
CREATE INDEX idx_invoices_xero_invoice_id ON public.invoices(xero_invoice_id);
CREATE INDEX idx_xero_tokens_user_id ON public.xero_tokens(user_id);
CREATE INDEX idx_xero_oauth_states_user_id ON public.xero_oauth_states(user_id);
