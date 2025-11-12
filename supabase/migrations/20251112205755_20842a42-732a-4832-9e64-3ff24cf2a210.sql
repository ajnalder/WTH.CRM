-- Drop the existing check constraint on status
ALTER TABLE public.domains DROP CONSTRAINT IF EXISTS domains_status_check;

-- Rename the status column to platform
ALTER TABLE public.domains RENAME COLUMN status TO platform;

-- Update existing records to have a default platform
UPDATE public.domains SET platform = 'Webflow' WHERE platform IN ('active', 'expired', 'pending');

-- Set default value for the platform column
ALTER TABLE public.domains 
  ALTER COLUMN platform SET DEFAULT 'Webflow';

-- Add a check constraint to ensure only Webflow or Shopify values
ALTER TABLE public.domains 
  ADD CONSTRAINT domains_platform_check CHECK (platform IN ('Webflow', 'Shopify'));