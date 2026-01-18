import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Send, Eye, Type, Image, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuotes, useQuote } from '@/hooks/useQuotes';
import { useQuoteBlocks } from '@/hooks/useQuoteBlocks';
import { useQuoteItems } from '@/hooks/useQuoteItems';
import { useClients } from '@/hooks/useClients';
import { usePrimaryContact } from '@/hooks/usePrimaryContact';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useCompanyLogo } from '@/hooks/useCompanyLogo';
import { QuoteBlockEditor } from '@/components/quotes/QuoteBlockEditor';
import { QuotePricingTable } from '@/components/quotes/QuotePricingTable';
import { QuickClientDialog } from '@/components/quotes/QuickClientDialog';
import { QuoteHeader } from '@/components/quotes/QuoteHeader';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAction, useMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';

type GeneratedQuoteDraft = {
  title: string | null;
  project_type: string | null;
  sections: Array<{
    id: string;
    title: string;
    paragraphs: string[];
    bullet_groups: Array<{
      heading: string | null;
      paragraph: string | null;
      bullets: string[];
    }>;
  }>;
  items: Array<{ description: string; quantity: number; rate: number; is_optional: boolean }>;
};

export default function QuoteBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clients } = useClients();
  const { settings } = useCompanySettings();
  const { logo, logoInverse } = useCompanyLogo();
  const { createQuote, updateQuote, generateNextQuoteNumber } = useQuotes();
  const { data: existingQuote, isLoading: quoteLoading } = useQuote(id);
  const { blocks, addBlock, updateBlock, deleteBlock, reorderBlocks } = useQuoteBlocks(id);
  const { items, addItem, updateItem, deleteItem, total } = useQuoteItems(id);
  const { user } = useAuth();
  const sendQuoteNotification = useMutation(api.quoteNotifications.sendQuoteNotification);
  const generateFromTranscript = useAction(api.quotes.generateFromTranscript);

  const [quoteData, setQuoteData] = useState({
    client_id: '',
    title: '',
    project_type: '',
    valid_until: '',
    deposit_percentage: 50,
    contact_name: '',
    contact_email: '',
    cover_image_url: '',
    tone: 'neutral',
  });
  const [nextQuoteNumber, setNextQuoteNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<GeneratedQuoteDraft | null>(null);

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
        tone: existingQuote.tone || 'neutral',
      });
      setNextQuoteNumber(existingQuote.quote_number);
      setTranscript(existingQuote.ai_transcript || '');
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
        tone: quoteData.tone,
        ai_transcript: transcript.trim() || undefined,
      });
      if (generatedDraft) {
        await applyGeneratedDraft(newQuote.id, generatedDraft);
      }
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

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const formatInline = (value: string) => escapeHtml(value);

  const buildSectionHtml = (section: GeneratedQuoteDraft['sections'][number]) => {
    const parts: string[] = [];
    section.paragraphs.forEach((text) => {
      parts.push(`<p>${formatInline(text)}</p>`);
    });
    section.bullet_groups.forEach((group) => {
      if (group.heading) {
        parts.push(`<p><strong>${formatInline(group.heading)}</strong></p>`);
      }
      if (group.paragraph) {
        parts.push(`<p>${formatInline(group.paragraph)}</p>`);
      }
      if (group.bullets.length > 0) {
        parts.push(
          `<ul class="list-disc pl-6">${group.bullets
            .map((text) => `<li>${formatInline(text)}</li>`)
            .join('')}</ul>`
        );
      }
    });
    return parts.join('');
  };

  const applyGeneratedDraft = async (quoteId: string, draft: GeneratedQuoteDraft) => {
    const sections = draft.sections.filter(
      (section) => section.paragraphs.length > 0 || section.bullet_groups.length > 0
    );
    if (sections.length === 0) {
      throw new Error('No sections generated');
    }

    for (let index = 0; index < sections.length; index += 1) {
      const section = sections[index];
      await addBlock({
        quote_id: quoteId,
        block_type: 'text',
        order_index: index,
        title: section.title,
        content: buildSectionHtml(section),
      });
    }

    if (draft.items.length > 0) {
      await Promise.all(
        draft.items.map((item, index) =>
          addItem({
            quote_id: quoteId,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate,
            is_optional: item.is_optional,
            order_index: index,
          })
        )
      );

      const newTotal = draft.items
        .filter((item) => !item.is_optional)
        .reduce((sum, item) => sum + item.quantity * item.rate, 0);
      await updateQuote({ id: quoteId, updates: { total_amount: newTotal } });
    }
  };

  const clearQuoteContent = async () => {
    await Promise.all(blocks.map((block) => deleteBlock(block.id)));
    await Promise.all(items.map((item) => deleteItem(item.id)));
  };

  const handleGenerateFromTranscript = async () => {
    const resolvedTranscript = transcript.trim() || existingQuote?.ai_transcript || '';
    if (!resolvedTranscript) {
      toast({ title: 'Error', description: 'Paste the transcript first', variant: 'destructive' });
      return;
    }
    if (!quoteData.client_id) {
      toast({ title: 'Error', description: 'Select a client first', variant: 'destructive' });
      return;
    }
    setIsGenerating(true);
    try {
      const draft = await generateFromTranscript({
        userId: user?.id,
        transcript: resolvedTranscript,
        tone: quoteData.tone,
        title: quoteData.title || undefined,
        project_type: quoteData.project_type || undefined,
        client_name: selectedClient?.company || undefined,
      });

      setGeneratedDraft(draft as GeneratedQuoteDraft);
      const nextTitle = quoteData.title || draft.title || '';
      const nextProjectType = quoteData.project_type || draft.project_type || '';
      setQuoteData((prev) => ({
        ...prev,
        title: nextTitle,
        project_type: nextProjectType,
      }));

      if (!id) {
        const newQuote = await createQuote({
          client_id: quoteData.client_id,
          title: nextTitle || 'Untitled quote',
          project_type: nextProjectType || undefined,
          valid_until: quoteData.valid_until || undefined,
          deposit_percentage: quoteData.deposit_percentage,
          total_amount: 0,
          contact_name: quoteData.contact_name || undefined,
          contact_email: quoteData.contact_email || undefined,
          tone: quoteData.tone,
          ai_transcript: resolvedTranscript,
        });
        await applyGeneratedDraft(newQuote.id, draft as GeneratedQuoteDraft);
        navigate(`/quotes/${newQuote.id}`, { replace: true });
        return;
      }

      await updateQuote({
        id,
        updates: {
          tone: quoteData.tone,
          ai_transcript: resolvedTranscript,
        },
      });
      await clearQuoteContent();
      await applyGeneratedDraft(id, draft as GeneratedQuoteDraft);
      toast({ title: 'Draft applied', description: 'Draft sections have been added to the quote.' });
    } catch (error) {
      console.error('Error generating quote draft:', error);
      toast({ title: 'Error', description: 'Failed to generate draft quote', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
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
            creatorName={existingQuote?.creator_name || user?.fullName || settings?.owner_name}
            creatorEmail={settings?.owner_name ? undefined : undefined}
            coverImageUrl={quoteData.cover_image_url}
            logoBase64={logo}
            logoInverseBase64={logoInverse}
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
            <div className="space-y-2">
              <Label>Quote Tone</Label>
              <Select
                value={quoteData.tone}
                onValueChange={(value) => {
                  setQuoteData({ ...quoteData, tone: value });
                  if (id) {
                    updateQuote({ id, updates: { tone: value } });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relaxed">Relaxed</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Transcript</Label>
              <Textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste your meeting transcript or voice note here..."
                className="min-h-[140px]"
              />
              <p className="text-xs text-muted-foreground">
                We will draft sections and line items from this transcript. Edit anything before sending.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={handleGenerateFromTranscript}
                  disabled={isGenerating}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isGenerating ? 'Generating...' : id ? 'Regenerate Quote' : 'Convert to Quote'}
                </Button>
              </div>
            </div>
          </div>
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
