-- Add unsubscribe functionality to contacts table
ALTER TABLE public.contacts 
ADD COLUMN email_subscribed boolean NOT NULL DEFAULT true,
ADD COLUMN unsubscribed_at timestamp with time zone;

-- Create email campaigns table
CREATE TABLE public.email_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  content_html text NOT NULL,
  content_json jsonb, -- For storing drag-drop builder data
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent', 'paused')),
  scheduled_at timestamp with time zone,
  sent_at timestamp with time zone,
  recipient_count integer DEFAULT 0,
  delivered_count integer DEFAULT 0,
  opened_count integer DEFAULT 0,
  clicked_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create email templates table for reusable templates
CREATE TABLE public.email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  content_html text NOT NULL,
  content_json jsonb, -- For storing drag-drop builder data
  thumbnail_url text, -- For template preview
  is_default boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create campaign sends table to track individual email sends
CREATE TABLE public.campaign_sends (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid NOT NULL,
  contact_id uuid NOT NULL,
  email_address text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'bounced', 'failed')),
  sent_at timestamp with time zone,
  delivered_at timestamp with time zone,
  opened_at timestamp with time zone,
  clicked_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_sends ENABLE ROW LEVEL SECURITY;

-- RLS policies for email campaigns
CREATE POLICY "Users can create their own campaigns" 
ON public.email_campaigns 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own campaigns" 
ON public.email_campaigns 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" 
ON public.email_campaigns 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" 
ON public.email_campaigns 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for email templates
CREATE POLICY "Users can create their own templates" 
ON public.email_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own templates" 
ON public.email_templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" 
ON public.email_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" 
ON public.email_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for campaign sends
CREATE POLICY "Users can create campaign sends for their campaigns" 
ON public.campaign_sends 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.email_campaigns 
  WHERE id = campaign_sends.campaign_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Users can view campaign sends for their campaigns" 
ON public.campaign_sends 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.email_campaigns 
  WHERE id = campaign_sends.campaign_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Users can update campaign sends for their campaigns" 
ON public.campaign_sends 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.email_campaigns 
  WHERE id = campaign_sends.campaign_id 
  AND user_id = auth.uid()
));

-- Create triggers for updated_at columns
CREATE TRIGGER update_email_campaigns_updated_at
BEFORE UPDATE ON public.email_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();