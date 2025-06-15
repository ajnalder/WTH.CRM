import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Check, X, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Quote, QuoteElement } from '@/types/quoteTypes';
import { QuoteElementRenderer } from '@/components/quotes/QuoteElementRenderer';
import { transformSupabaseQuote, transformSupabaseQuoteElement } from '@/utils/quoteTypeHelpers';

const QuoteView = () => {
  const { token } = useParams<{ token: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [elements, setElements] = useState<QuoteElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!token) {
        setError('Invalid quote link');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch quote by public token
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
          .eq('public_link_token', token)
          .single();

        if (quoteError) throw quoteError;

        if (!quoteData) {
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

        if (elementsError) throw elementsError;

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

        // Update quote status to 'viewed' if it's currently 'sent'
        if (quoteData.status === 'sent') {
          await supabase
            .from('quotes')
            .update({ status: 'viewed' })
            .eq('id', quoteData.id);
        }

      } catch (error) {
        console.error('Error fetching quote:', error);
        setError('Failed to load quote');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuote();
  }, [token]);

  const updateQuoteStatus = async (status: 'accepted' | 'rejected') => {
    if (!quote) return;

    try {
      await supabase
        .from('quotes')
        .update({ status })
        .eq('id', quote.id);

      setQuote({ ...quote, status });
    } catch (error) {
      console.error('Error updating quote status:', error);
    }
  };

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
        </div>
      </div>
    );
  }

  const isExpired = quote.valid_until ? new Date(quote.valid_until) < new Date() : false;
  const canRespond = quote.status !== 'accepted' && quote.status !== 'rejected' && !isExpired;

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

                {canRespond && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => updateQuoteStatus('rejected')}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                    <Button onClick={() => updateQuoteStatus('accepted')}>
                      <Check className="w-4 h-4 mr-2" />
                      Accept Quote
                    </Button>
                  </>
                )}
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

export default QuoteView;
