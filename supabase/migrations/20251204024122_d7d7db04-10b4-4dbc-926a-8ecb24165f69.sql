-- Add inverse logo field for dark backgrounds
ALTER TABLE public.company_settings
ADD COLUMN logo_inverse_base64 text;