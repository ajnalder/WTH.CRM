
-- Drop quote-related triggers first
DROP TRIGGER IF EXISTS trigger_calculate_quote_totals ON public.quote_elements;
DROP TRIGGER IF EXISTS trigger_set_quote_number ON public.quotes;

-- Drop quote-related functions
DROP FUNCTION IF EXISTS public.calculate_quote_totals();
DROP FUNCTION IF EXISTS public.set_quote_number();
DROP FUNCTION IF EXISTS public.generate_quote_number();

-- Drop quote tables (quote_elements first due to foreign key)
DROP TABLE IF EXISTS public.quote_elements;
DROP TABLE IF EXISTS public.quotes;
