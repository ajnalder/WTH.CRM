-- Create storage bucket for email images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'email-images', 
  'email-images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Create table for email images metadata
CREATE TABLE public.email_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_images ENABLE ROW LEVEL SECURITY;

-- Create policies for email images
CREATE POLICY "Users can view their own email images" 
ON public.email_images 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email images" 
ON public.email_images 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email images" 
ON public.email_images 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email images" 
ON public.email_images 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage policies for email images
CREATE POLICY "Email images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'email-images');

CREATE POLICY "Users can upload their own email images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'email-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own email images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'email-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own email images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'email-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add trigger for updated_at
CREATE TRIGGER update_email_images_updated_at
BEFORE UPDATE ON public.email_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enhance contacts table for email marketing
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS email_subscribed BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMP WITH TIME ZONE;

-- Update campaign_sends table for better tracking
ALTER TABLE public.campaign_sends 
ADD COLUMN IF NOT EXISTS opened_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS error_message TEXT;