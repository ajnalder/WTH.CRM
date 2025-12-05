-- Add billing_description column to tasks table for storing customized invoice line item descriptions
ALTER TABLE public.tasks ADD COLUMN billing_description text;