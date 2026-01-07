import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Send, Eye, Type, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuotes, useQuote } from '@/hooks/useQuotes';
import { useQuoteBlocks } from '@/hooks/useQuoteBlocks';
import { useQuoteItems } from '@/hooks/useQuoteItems';
import { useClients } from '@/hooks/useClients';
import { usePrimaryContact } from '@/hooks/usePrimaryContact';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { QuoteBlockEditor } from '@/components/quotes/QuoteBlockEditor';
import { QuotePricingTable } from '@/components/quotes/QuotePricingTable';
import { QuickClientDialog } from '@/components/quotes/QuickClientDialog';
import { QuoteHeader } from '@/components/quotes/QuoteHeader';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';

export default function QuoteBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clients } = useClients();
  const { settings } = useCompanySettings();
  const { createQuote, updateQuote, generateNextQuoteNumber } = useQuotes();
  const { data: existingQuote, isLoading: quoteLoading } = useQuote(id);
  const { blocks, addBlock, updateBlock, deleteBlock, reorderBlocks } = useQuoteBlocks(id);
  const { items, addItem, updateItem, deleteItem, total } = useQuoteItems(id);
  const { user } = useAuth();
  const sendQuoteNotification = useMutation(api.quoteNotifications.sendQuoteNotification);

  const [quoteData, setQuoteData] = useState({
    client_id: '',
    title: '',
    project_type: '',
    valid_until: '',
    deposit_percentage: 50,
    contact_name: '',
    contact_email: '',
    cover_image_url: '',
  });
  const [nextQuoteNumber, setNextQuoteNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch primary contact when client changes
  const { data: primaryContact } = usePrimaryContact(quoteData.client_id || undefined);

  useEffect(() => {
    if (!id) {
      generateNextQuoteNumber().then(setNextQuoteNumber);
    }
  }, [id]);

  useEffect(() => {
    if (existingQuote) {
      setQuoteData({
        client_id: existingQuote.client_id,
        title: existingQuote.title,
        project_type: existingQuote.project_type || '',
        valid_until: existingQuote.valid_until || '',
        deposit_percentage: existingQuote.deposit_percentage,
        contact_name: existingQuote.contact_name || '',
        contact_email: existingQuote.contact_email || '',
        cover_image_url: existingQuote.cover_image_url || '',
      });
      setNextQuoteNumber(existingQuote.quote_number);
    }
  }, [existingQuote]);

  // Auto-fill contact info when client changes and we have a primary contact
  useEffect(() => {
    if (primaryContact && !quoteData.contact_name && !quoteData.contact_email) {
      setQuoteData(prev => ({
        ...prev,
        contact_name: primaryContact.name,
        contact_email: primaryContact.email,
      }));
    }
  }, [primaryContact]);

  const handleClientCreated = (clientId: string, contactName: string, contactEmail: string) => {
    setQuoteData(prev => ({
      ...prev,
      client_id: clientId,
      contact_name: contactName,
      contact_email: contactEmail,
    }));
  };

  const handleClientChange = (clientId: string) => {
    setQuoteData(prev => ({
      ...prev,
      client_id: clientId,
      contact_name: '',
      contact_email: '',
    }));
  };

  const handleCreateQuote = async () => {
    if (!quoteData.client_id || !quoteData.title) {
      toast({ title: 'Error', description: 'Please fill in client and title', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const newQuote = await createQuote({
        client_id: quoteData.client_id,
        title: quoteData.title,
        project_type: quoteData.project_type || undefined,
        valid_until: quoteData.valid_until || undefined,
        deposit_percentage: quoteData.deposit_percentage,
        total_amount: 0,
        contact_name: quoteData.contact_name || undefined,
        contact_email: quoteData.contact_email || undefined,
      });
      navigate(`/quotes/${newQuote.id}`, { replace: true });
    } catch (error) {
      console.error('Error creating quote:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = () => {
    if (!id) return;
    updateQuote({
      id,
      updates: {
        ...quoteData,
        total_amount: total,
      },
    });
    toast({ title: 'Saved', description: 'Quote saved successfully' });
  };

  const handleAddBlock = async (type: 'text' | 'image') => {
    if (!id) return;
    await addBlock({
      quote_id: id,
      block_type: type,
      order_index: blocks.length,
      title: type === 'text' ? 'New Section' : undefined,
      content: type === 'text' ? '<p>Enter your content here...</p>' : undefined,
    });
  };

  const handleSendQuote = async () => {
    if (!id || !existingQuote) return;
    
    try {
      updateQuote({ id, updates: { status: 'sent', total_amount: total } });
      
      await sendQuoteNotification({
        userId: user?.id,
        toEmail: user?.email || undefined,
        quoteId: id,
        quoteNumber: existingQuote.quote_number,
        clientName: selectedClient?.company || 'Client',
        totalAmount: total,
        action: 'sent',
      });
      
      toast({ title: 'Success', description: 'Quote sent successfully' });
    } catch (error) {
      console.error('Error sending quote:', error);
      toast({ title: 'Error', description: 'Failed to send quote', variant: 'destructive' });
    }
  };

  const handleCoverImageChange = (url: string | null) => {
    setQuoteData(prev => ({ ...prev, cover_image_url: url || '' }));
    if (id) {
      updateQuote({ id, updates: { cover_image_url: url } });
    }
  };

  const selectedClient = clients.find(c => c.id === quoteData.client_id);

  if (quoteLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/quotes')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {id ? `Edit Quote ${nextQuoteNumber}` : 'New Quote'}
            </h1>
            <p className="text-muted-foreground">
              {id ? 'Edit your quote details and content' : 'Create a new proposal for your client'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {id && (
            <>
              <Button variant="outline" onClick={() => window.open(`/quote/view/${existingQuote?.public_token}`, '_blank')}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button onClick={handleSendQuote}>
                <Send className="mr-2 h-4 w-4" />
                Send Quote
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Quote Header Preview (only show when we have a client) */}
      {id && selectedClient && (
        <QuoteHeader
          clientName={selectedClient.company}
          contactName={quoteData.contact_name}
          title={quoteData.title}
          projectType={quoteData.project_type}
          creatorName={existingQuote?.creator_name}
          creatorEmail={settings?.owner_name ? undefined : undefined}
          coverImageUrl={quoteData.cover_image_url}
          logoBase64={settings?.logo_base64}
          logoInverseBase64={settings?.logo_inverse_base64}
          companyName={settings?.company_name}
          onCoverImageChange={handleCoverImageChange}
          editable={true}
        />
      )}

      {/* Quote Details */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quote Number</Label>
              <Input value={nextQuoteNumber} disabled />
            </div>
            <div className="space-y-2">
              <Label>Client</Label>
              <div className="flex gap-2">
                <Select
                  value={quoteData.client_id}
                  onValueChange={handleClientChange}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <QuickClientDialog onClientCreated={handleClientCreated} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Contact Name</Label>
              <Input
                value={quoteData.contact_name}
                onChange={(e) => setQuoteData({ ...quoteData, contact_name: e.target.value })}
                placeholder="e.g., John Smith"
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input
                value={quoteData.contact_email}
                onChange={(e) => setQuoteData({ ...quoteData, contact_email: e.target.value })}
                placeholder="e.g., john@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={quoteData.title}
                onChange={(e) => setQuoteData({ ...quoteData, title: e.target.value })}
                placeholder="e.g., Shopify Store Build"
              />
            </div>
            <div className="space-y-2">
              <Label>Project Type</Label>
              <Input
                value={quoteData.project_type}
                onChange={(e) => setQuoteData({ ...quoteData, project_type: e.target.value })}
                placeholder="e.g., E-commerce site"
              />
            </div>
            <div className="space-y-2">
              <Label>Valid Until</Label>
              <Input
                type="date"
                value={quoteData.valid_until}
                onChange={(e) => setQuoteData({ ...quoteData, valid_until: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Deposit Percentage</Label>
              <Input
                type="number"
                value={quoteData.deposit_percentage}
                onChange={(e) => setQuoteData({ ...quoteData, deposit_percentage: parseInt(e.target.value) || 50 })}
              />
            </div>
          </div>
          {!id && (
            <Button onClick={handleCreateQuote} disabled={isSaving}>
              Create Quote & Continue
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Content Blocks */}
      {id && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Content Blocks</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleAddBlock('text')}>
                  <Type className="mr-2 h-4 w-4" />
                  Add Text
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAddBlock('image')}>
                  <Image className="mr-2 h-4 w-4" />
                  Add Image
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {blocks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No content blocks yet. Add text or images to build your quote.
                </div>
              ) : (
                blocks.map((block) => (
                  <QuoteBlockEditor
                    key={block.id}
                    block={block}
                    onUpdate={(updates) => updateBlock({ id: block.id, updates })}
                    onDelete={() => deleteBlock(block.id)}
                  />
                ))
              )}
            </CardContent>
          </Card>

          <QuotePricingTable
            quoteId={id}
            items={items}
            onAddItem={addItem}
            onUpdateItem={updateItem}
            onDeleteItem={deleteItem}
            total={total}
          />
        </>
      )}
    </div>
  );
}
