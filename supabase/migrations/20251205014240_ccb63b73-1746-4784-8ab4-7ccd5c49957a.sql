-- Add billable_amount column to tasks table for one-off task invoicing
ALTER TABLE public.tasks 
ADD COLUMN billable_amount numeric NULL;