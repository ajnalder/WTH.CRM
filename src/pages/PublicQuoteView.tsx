import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useQuoteByToken } from '@/hooks/useQuotes';
import { useQuoteBlocks } from '@/hooks/useQuoteBlocks';
import { useQuoteItems } from '@/hooks/useQuoteItems';
import { useQuoteEvents } from '@/hooks/useQuoteEvents';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function PublicQuoteView() {
  const { token } = useParams();
  const { data: quote, isLoading, refetch } = useQuoteByToken(token);
  const { blocks } = useQuoteBlocks(quote?.id);
  const { items, total } = useQuoteItems(quote?.id);
  const { logEvent } = useQuoteEvents();
  const { settings } = useCompanySettings();
  
  const [clientName, setClientName] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);
  const [hasLoggedView, setHasLoggedView] = useState(false);

  // Log view event on first load
  useEffect(() => {
    if (quote && !hasLoggedView && quote.status !== 'accepted') {
      setHasLoggedView(true);
      logEvent({ quote_id: quote.id, event_type: 'opened' });
      
      // Update viewed_at if not already set
      if (!quote.viewed_at) {
        supabase
          .from('quotes')
          .update({ viewed_at: new Date().toISOString(), status: 'viewed' })
          .eq('id', quote.id)
          .then(() => {
            // Send notification
            fetch(`https://jnehwoaockudqsdqwfwl.supabase.co/functions/v1/send-quote-notification`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ quote_id: quote.id, action: 'viewed' }),
            });
          });
      }
    }
  }, [quote, hasLoggedView, logEvent]);

  const handleAccept = async () => {
    if (!quote || !clientName.trim()) return;
    
    setIsAccepting(true);
    try {
      await logEvent({ quote_id: quote.id, event_type: 'accepted' });
      
      await supabase
        .from('quotes')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_by_name: clientName.trim(),
        })
        .eq('id', quote.id);
      
      // Send notification
      await fetch(`https://jnehwoaockudqsdqwfwl.supabase.co/functions/v1/send-quote-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quote_id: quote.id,
          action: 'accepted',
          accepted_by_name: clientName.trim(),
        }),
      });
      
      refetch();
    } catch (error) {
      console.error('Error accepting quote:', error);
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold">Quote Not Found</h1>
          <p className="text-muted-foreground">This quote may have been removed or the link is invalid.</p>
        </div>
      </div>
    );
  }

  const isAccepted = quote.status === 'accepted';
  const optionalItems = items.filter((i) => i.is_optional);
  const requiredItems = items.filter((i) => !i.is_optional);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            {settings?.logo_base64 ? (
              <img src={settings.logo_base64} alt="Company Logo" className="h-12 mb-4" />
            ) : (
              <h2 className="text-xl font-bold">{settings?.company_name || 'Company'}</h2>
            )}
            <div className="text-sm text-muted-foreground">
              {settings?.address_line1 && <div>{settings.address_line1}</div>}
              {settings?.address_line2 && <div>{settings.address_line2}</div>}
              {settings?.address_line3 && <div>{settings.address_line3}</div>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">Proposal</div>
            <div className="text-muted-foreground">{quote.quote_number}</div>
            <div className="text-sm text-muted-foreground mt-2">
              Date: {format(new Date(quote.created_at), 'dd MMMM yyyy')}
            </div>
            {quote.valid_until && (
              <div className="text-sm text-muted-foreground">
                Valid until: {format(new Date(quote.valid_until), 'dd MMMM yyyy')}
              </div>
            )}
          </div>
        </div>

        {/* Client Info */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Prepared for</div>
            <div className="text-xl font-semibold">{quote.clients?.company}</div>
          </CardContent>
        </Card>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-8">{quote.title}</h1>

        {/* Content Blocks */}
        <div className="space-y-8 mb-8">
          {blocks.map((block) => (
            <div key={block.id}>
              {block.title && <h2 className="text-xl font-semibold mb-4">{block.title}</h2>}
              {block.block_type === 'text' && block.content && (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: block.content }}
                />
              )}
              {block.block_type === 'image' && block.image_url && (
                <img
                  src={block.image_url}
                  alt={block.title || 'Image'}
                  className="rounded-lg max-w-full"
                />
              )}
            </div>
          ))}
        </div>

        {/* Pricing Table */}
        {requiredItems.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Our Quotation</h2>
              <div className="space-y-3">
                {requiredItems.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <div className="font-medium">{item.description}</div>
                      {item.quantity > 1 && (
                        <div className="text-sm text-muted-foreground">
                          {item.quantity} × ${item.rate.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="font-semibold">${item.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toLocaleString()} NZD</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Optional Items */}
        {optionalItems.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Optional Add-ons</h2>
              <div className="space-y-3">
                {optionalItems.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="font-medium">{item.description}</div>
                    <div className="font-semibold">${item.amount.toLocaleString()} NZD</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Terms */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
            <p className="text-muted-foreground mb-4">
              Once you're ready to proceed, click the Accept Proposal button below.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Payment structure:</strong> {quote.deposit_percentage}% deposit,{' '}
              {100 - quote.deposit_percentage - 10}% progress payment during the build, and the final 10% once the site is live.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>Usage rights:</strong> Once full payment is received, you own the rights to the design and build.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>Cancellation:</strong> If the project is cancelled after work has started, only the portion completed will be invoiced.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              All pricing excludes GST.
            </p>
          </CardContent>
        </Card>

        {/* Acceptance Section */}
        <Card>
          <CardContent className="p-6">
            {isAccepted ? (
              <div className="text-center py-4">
                <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h2 className="text-xl font-semibold text-green-600 mb-2">Proposal Accepted</h2>
                <p className="text-muted-foreground">
                  Accepted by {quote.accepted_by_name} on{' '}
                  {format(new Date(quote.accepted_at!), 'dd MMMM yyyy')}
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-4">Accept Proposal</h2>
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">From</div>
                    <div className="font-semibold">{settings?.owner_name || 'Your Name'}</div>
                    <div className="text-sm text-muted-foreground">{settings?.company_name || 'What the Heck'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Client Signature</div>
                    <Input
                      placeholder="Enter your full name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="font-semibold"
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  By clicking Accept Proposal, you agree to the terms and pricing outlined above.
                </p>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleAccept}
                  disabled={!clientName.trim() || isAccepting}
                >
                  {isAccepting ? 'Processing...' : 'Accept Proposal'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
