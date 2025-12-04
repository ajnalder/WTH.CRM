-- Add contact name, contact email, and cover image fields to quotes table
ALTER TABLE public.quotes
ADD COLUMN contact_name text,
ADD COLUMN contact_email text,
ADD COLUMN cover_image_url text;