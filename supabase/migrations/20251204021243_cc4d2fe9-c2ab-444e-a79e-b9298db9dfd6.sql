-- Add creator_name column to quotes table to store the name at time of creation
ALTER TABLE public.quotes 
ADD COLUMN creator_name text DEFAULT NULL;