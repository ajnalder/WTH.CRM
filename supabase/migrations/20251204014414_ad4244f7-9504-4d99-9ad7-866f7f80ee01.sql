-- Create quotes table
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  quote_number TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  valid_until DATE,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  deposit_percentage NUMERIC NOT NULL DEFAULT 50,
  project_type TEXT,
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by_name TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE,
  public_token UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quote_blocks table
CREATE TABLE public.quote_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL,
  title TEXT,
  content TEXT,
  image_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quote_items table (pricing items)
CREATE TABLE public.quote_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  rate NUMERIC NOT NULL DEFAULT 0,
  amount NUMERIC NOT NULL DEFAULT 0,
  is_optional BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quote_templates table
CREATE TABLE public.quote_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  block_type TEXT NOT NULL,
  content TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quote_events table for tracking
CREATE TABLE public.quote_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_events ENABLE ROW LEVEL SECURITY;

-- Quotes policies
CREATE POLICY "Users can view their own quotes" ON public.quotes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own quotes" ON public.quotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quotes" ON public.quotes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own quotes" ON public.quotes FOR DELETE USING (auth.uid() = user_id);

-- Quote blocks policies (through quote ownership)
CREATE POLICY "Users can view their quote blocks" ON public.quote_blocks FOR SELECT USING (EXISTS (SELECT 1 FROM public.quotes WHERE quotes.id = quote_blocks.quote_id AND quotes.user_id = auth.uid()));
CREATE POLICY "Users can create their quote blocks" ON public.quote_blocks FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.quotes WHERE quotes.id = quote_blocks.quote_id AND quotes.user_id = auth.uid()));
CREATE POLICY "Users can update their quote blocks" ON public.quote_blocks FOR UPDATE USING (EXISTS (SELECT 1 FROM public.quotes WHERE quotes.id = quote_blocks.quote_id AND quotes.user_id = auth.uid()));
CREATE POLICY "Users can delete their quote blocks" ON public.quote_blocks FOR DELETE USING (EXISTS (SELECT 1 FROM public.quotes WHERE quotes.id = quote_blocks.quote_id AND quotes.user_id = auth.uid()));

-- Quote items policies (through quote ownership)
CREATE POLICY "Users can view their quote items" ON public.quote_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.quotes WHERE quotes.id = quote_items.quote_id AND quotes.user_id = auth.uid()));
CREATE POLICY "Users can create their quote items" ON public.quote_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.quotes WHERE quotes.id = quote_items.quote_id AND quotes.user_id = auth.uid()));
CREATE POLICY "Users can update their quote items" ON public.quote_items FOR UPDATE USING (EXISTS (SELECT 1 FROM public.quotes WHERE quotes.id = quote_items.quote_id AND quotes.user_id = auth.uid()));
CREATE POLICY "Users can delete their quote items" ON public.quote_items FOR DELETE USING (EXISTS (SELECT 1 FROM public.quotes WHERE quotes.id = quote_items.quote_id AND quotes.user_id = auth.uid()));

-- Quote templates policies
CREATE POLICY "Users can view their quote templates" ON public.quote_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their quote templates" ON public.quote_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their quote templates" ON public.quote_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their quote templates" ON public.quote_templates FOR DELETE USING (auth.uid() = user_id);

-- Quote events policies (through quote ownership)
CREATE POLICY "Users can view their quote events" ON public.quote_events FOR SELECT USING (EXISTS (SELECT 1 FROM public.quotes WHERE quotes.id = quote_events.quote_id AND quotes.user_id = auth.uid()));
CREATE POLICY "Users can create their quote events" ON public.quote_events FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.quotes WHERE quotes.id = quote_events.quote_id AND quotes.user_id = auth.uid()));

-- Public access for quote viewing (client side)
CREATE POLICY "Public can view quotes by token" ON public.quotes FOR SELECT USING (true);
CREATE POLICY "Public can update quote acceptance" ON public.quotes FOR UPDATE USING (true);
CREATE POLICY "Public can view quote blocks by token" ON public.quote_blocks FOR SELECT USING (true);
CREATE POLICY "Public can view quote items by token" ON public.quote_items FOR SELECT USING (true);
CREATE POLICY "Public can create quote events" ON public.quote_events FOR INSERT WITH CHECK (true);

-- Create updated_at trigger for quotes
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for quote_templates
CREATE TRIGGER update_quote_templates_updated_at
  BEFORE UPDATE ON public.quote_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create unique index on public_token
CREATE UNIQUE INDEX quotes_public_token_idx ON public.quotes(public_token);