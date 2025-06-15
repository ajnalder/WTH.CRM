
-- Create quotes table
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  client_id UUID REFERENCES public.clients(id),
  quote_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')),
  valid_until DATE,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  gst_rate DECIMAL(5,2) NOT NULL DEFAULT 15.00,
  gst_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  terms_and_conditions TEXT,
  public_link_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'base64url'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quote elements table for drag-and-drop components
CREATE TABLE public.quote_elements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
  element_type TEXT NOT NULL CHECK (element_type IN ('text', 'image', 'pricing_grid', 'line_item', 'spacer')),
  content JSONB NOT NULL DEFAULT '{}',
  position_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_elements ENABLE ROW LEVEL SECURITY;

-- RLS policies for quotes
CREATE POLICY "Users can view their own quotes" 
  ON public.quotes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quotes" 
  ON public.quotes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quotes" 
  ON public.quotes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quotes" 
  ON public.quotes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Allow public access to quotes via public_link_token (for viewing quotes without auth)
CREATE POLICY "Allow public quote viewing via token"
  ON public.quotes
  FOR SELECT
  USING (public_link_token IS NOT NULL);

-- RLS policies for quote elements
CREATE POLICY "Users can view elements of their own quotes" 
  ON public.quote_elements 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.quotes 
      WHERE quotes.id = quote_elements.quote_id 
      AND quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create elements for their own quotes" 
  ON public.quote_elements 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quotes 
      WHERE quotes.id = quote_elements.quote_id 
      AND quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update elements of their own quotes" 
  ON public.quote_elements 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.quotes 
      WHERE quotes.id = quote_elements.quote_id 
      AND quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete elements of their own quotes" 
  ON public.quote_elements 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.quotes 
      WHERE quotes.id = quote_elements.quote_id 
      AND quotes.user_id = auth.uid()
    )
  );

-- Allow public access to quote elements via public quote token
CREATE POLICY "Allow public quote element viewing via quote token"
  ON public.quote_elements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quotes 
      WHERE quotes.id = quote_elements.quote_id 
      AND quotes.public_link_token IS NOT NULL
    )
  );

-- Function to automatically generate quote numbers
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  current_year TEXT;
BEGIN
  current_year := EXTRACT(year FROM now())::TEXT;
  
  SELECT 'QT' || current_year || '-' || LPAD((
    COALESCE(
      MAX(CAST(SUBSTRING(quote_number FROM 'QT\d{4}-(\d+)') AS INTEGER)), 
      0
    ) + 1
  )::TEXT, 4, '0')
  INTO new_number
  FROM public.quotes
  WHERE quote_number ~ ('^QT' || current_year || '-\d+$');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate quote numbers
CREATE OR REPLACE FUNCTION set_quote_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quote_number IS NULL OR NEW.quote_number = '' THEN
    NEW.quote_number := generate_quote_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_quote_number
  BEFORE INSERT ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION set_quote_number();

-- Function to calculate quote totals
CREATE OR REPLACE FUNCTION calculate_quote_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate subtotal from line items in quote elements
  UPDATE public.quotes 
  SET 
    subtotal = (
      SELECT COALESCE(SUM(CAST(elem.content->>'amount' AS DECIMAL(10,2))), 0)
      FROM public.quote_elements elem
      WHERE elem.quote_id = NEW.quote_id 
      AND elem.element_type = 'line_item'
      AND elem.content->>'amount' IS NOT NULL
    ),
    updated_at = now()
  WHERE id = NEW.quote_id;
  
  -- Update GST amount and total amount
  UPDATE public.quotes 
  SET 
    gst_amount = subtotal * (gst_rate / 100),
    total_amount = subtotal + (subtotal * (gst_rate / 100))
  WHERE id = NEW.quote_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate totals when quote elements change
CREATE TRIGGER trigger_calculate_quote_totals
  AFTER INSERT OR UPDATE OR DELETE ON public.quote_elements
  FOR EACH ROW
  EXECUTE FUNCTION calculate_quote_totals();
