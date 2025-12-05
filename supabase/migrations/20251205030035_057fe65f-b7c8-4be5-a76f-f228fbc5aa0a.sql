-- Add xero_contact_id column to clients table for linking with Xero contacts
ALTER TABLE public.clients ADD COLUMN xero_contact_id text;

-- Add index for faster lookups
CREATE INDEX idx_clients_xero_contact_id ON public.clients(xero_contact_id);