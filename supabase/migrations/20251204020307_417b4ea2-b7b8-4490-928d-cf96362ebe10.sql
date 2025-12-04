-- Add owner_name column to company_settings
ALTER TABLE public.company_settings 
ADD COLUMN owner_name text DEFAULT NULL;