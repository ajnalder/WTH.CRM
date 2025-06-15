
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Quote, QuoteElement } from '@/types/quoteTypes';
import { QuoteElementRenderer } from '@/components/quotes/QuoteElementRenderer';
import { transformSupabaseQuote, transformSupabaseQuoteElement } from '@/utils/quoteTypeHelpers';

const QuotePreview = () => {
  const { id } = useParams<{ id: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [elements, setElements] = useState<QuoteElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!id) {
        console.error('No quote ID provided');
        setError('Invalid quote ID');
        setIsLoading(false);
        return;
      }

      console.log('Fetching quote with ID:', id);

      try {
        // First try to get the current user session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Current session:', session ? 'authenticated' : 'unauthenticated');

        // If no session, we can't access quotes with RLS - need to implement public access
        if (!session) {
          console.log('No authenticated session, cannot access quotes table');
          setError('This preview requires authentication. Please access the quote through a public link instead.');
          setIsLoading(false);
          return;
        }

        // Fetch quote by ID (for internal preview with authentication)
        const { data: quoteData, error: quoteError } = await supabase
          .from('quotes')
          .select(`
            *,
            clients (
              id,
              company,
              phone
            )
          `)
          .eq('id', id)
          .single();

        console.log('Quote data response:', quoteData);
        console.log('Quote error:', quoteError);

        if (quoteError) {
          console.error('Supabase error:', quoteError);
          throw quoteError;
        }

        if (!quoteData) {
          console.error('No quote data found');
          setError('Quote not found');
          setIsLoading(false);
          return;
        }

        // Transform the quote data using our type helpers
        const transformedQuote = transformSupabaseQuote(quoteData);
        setQuote(transformedQuote);

        // Fetch quote elements
        const { data: elementsData, error: elementsError } = await supabase
          .from('quote_elements')
          .select('*')
          .eq('quote_id', quoteData.id)
          .order('position_order', { ascending: true });

        console.log('Elements data:', elementsData);
        console.log('Elements error:', elementsError);

        if (elementsError) {
          console.error('Elements error:', elementsError);
          throw elementsError;
        }

        // Transform the elements data using our type helpers
        const transformedElements = (elementsData || []).map(element => {
          try {
            return transformSupabaseQuoteElement(element);
          } catch (transformError) {
            console.error('Error transforming quote element:', transformError);
            return null;
          }
        }).filter(Boolean) as QuoteElement[];

        setElements(transformedElements);

      } catch (error) {
        console.error('Error fetching quote:', error);
        setError(`Failed to load quote: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuote();
  }, [id]);

  const downloadPDF = () => {
    // This would integrate with a PDF generation library
    // For now, we'll just show a placeholder
    alert('PDF download functionality would be implemented here');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😵</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quote Not Found</h1>
          <p className="text-gray-600">{error || 'The quote you\'re looking for doesn\'t exist or has been removed.'}</p>
          <p className="text-sm text-gray-500 mt-2">Quote ID: {id}</p>
          <p className="text-xs text-gray-400 mt-2">
            Tip: For public access, use the shareable link instead of the preview.
          </p>
        </div>
      </div>
    );
  }

  const isExpired = quote.valid_until ? new Date(quote.valid_until) < new Date() : false;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <img 
            src="/lovable-uploads/c848f237-7df6-492e-95f2-7ce8824226b0.png" 
            alt="What the Heck Logo" 
            className="h-12 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{quote.title}</h1>
          <p className="text-gray-600">{quote.quote_number}</p>
        </div>

        {/* Quote Status and Actions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant={quote.status === 'accepted' ? 'default' : 'secondary'}>
                  {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                </Badge>
                
                {quote.valid_until && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    Valid until {new Date(quote.valid_until).toLocaleDateString()}
                    {isExpired && <span className="text-red-600 ml-2">(Expired)</span>}
                  </div>
                )}

                <div className="flex items-center text-lg font-semibold">
                  <DollarSign className="w-5 h-5 mr-1" />
                  {quote.total_amount.toFixed(2)}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={downloadPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quote Content */}
        <Card>
          <CardContent className="p-8">
            {quote.description && (
              <div className="mb-8 text-gray-700">
                {quote.description}
              </div>
            )}

            {/* Quote Elements */}
            <div className="space-y-6">
              {elements.map((element) => (
                <QuoteElementRenderer
                  key={element.id}
                  element={element}
                  isSelected={false}
                  onUpdate={() => {}}
                  isEditable={false}
                />
              ))}
            </div>

            {/* Quote Totals */}
            <div className="mt-8 pt-6 border-t">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${quote.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST ({quote.gst_rate}%):</span>
                    <span>${quote.gst_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${quote.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            {quote.terms_and_conditions && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="font-semibold mb-3">Terms and Conditions</h3>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {quote.terms_and_conditions}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuotePreview;
