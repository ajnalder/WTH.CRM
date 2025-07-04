-- Add client_id field to tasks table to properly link tasks to clients
ALTER TABLE public.tasks 
ADD COLUMN client_id uuid REFERENCES public.clients(id);

-- Add index for better performance when querying tasks by client
CREATE INDEX idx_tasks_client_id ON public.tasks(client_id);