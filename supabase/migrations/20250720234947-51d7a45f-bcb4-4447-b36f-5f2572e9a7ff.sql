-- Add client_managed field to domains table
ALTER TABLE public.domains 
ADD COLUMN client_managed boolean NOT NULL DEFAULT false;