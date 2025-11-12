-- Add notes column to domains table
ALTER TABLE public.domains
ADD COLUMN notes text;