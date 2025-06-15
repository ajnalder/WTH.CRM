import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Save, Eye, ArrowLeft, Trash2, Image, Type, Grid, DollarSign, Minus, Share, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuotes } from '@/hooks/useQuotes';
import { useQuoteElements } from '@/hooks/useQuoteElements';
import { Quote, QuoteElement } from '@/types/quoteTypes';
import { QuoteElementRenderer } from '@/components/quotes/QuoteElementRenderer';
import { ElementToolbar } from '@/components/quotes/ElementToolbar';
import { QuoteHeader } from '@/components/quotes/QuoteHeader';
import { InvestmentBreakdown } from '@/components/quotes/InvestmentBreakdown';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const QuoteBuilder = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { quotes, updateQuote } = useQuotes();
  const { elements, createElement, updateElement, deleteElement, reorderElements } = useQuoteElements(id || null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (id && quotes.length > 0) {
      const foundQuote = quotes.find(q => q.id === id);
      setQuote(foundQuote || null);
    }
  }, [id, quotes]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(elements);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    reorderElements(items);
  };

  const addElement = async (type: QuoteElement['element_type']) => {
    let content = {};
    
    switch (type) {
      case 'text':
        content = { text: 'Click to edit text', fontSize: 'medium', textAlign: 'left' };
        break;
      case 'image':
        content = { url: '', alt: 'Image', alignment: 'center' };
        break;
      case 'line_item':
        content = { description: 'New service item', quantity: 1, rate: 0, amount: 0 };
        break;
      case 'spacer':
        content = { height: 20 };
        break;
      case 'pricing_grid':
        content = { 
          title: 'Pricing Table',
          columns: ['Feature', 'Basic', 'Premium'],
          rows: [
            { label: 'Feature 1', values: ['✓', '✓', '✓'] },
            { label: 'Feature 2', values: ['✗', '✓', '✓'] }
          ]
        };
        break;
    }

    await createElement({
      element_type: type,
      content
    });
  };

  const updateElementContent = async (elementId: string, newContent: any) => {
    await updateElement(elementId, { content: newContent });
  };

  const removeElement = async (elementId: string) => {
    await deleteElement(elementId);
    setSelectedElement(null);
  };

  const handleTotalChange = async (total: number) => {
    if (quote && total !== quote.subtotal) {
      const gstAmount = total * (quote.gst_rate / 100);
      const totalAmount = total + gstAmount;
      
      await updateQuote(quote.id, {
        subtotal: total,
        gst_amount: gstAmount,
        total_amount: totalAmount
      });
    }
  };

  const viewQuote = () => {
    if (quote?.public_link_token) {
      window.open(`/quote/${quote.public_link_token}`, '_blank');
    } else {
      // Allow preview using quote ID even without public link
      window.open(`/quote-preview/${quote?.id}`, '_blank');
    }
  };

  const generatePublicLink = async () => {
    if (!quote) return;

    try {
      // Generate a unique token for the public link
      const token = crypto.randomUUID();
      
      // Update quote with the public link token and status
      await updateQuote(quote.id, { 
        status: 'sent',
        public_link_token: token
      });
      
      toast({
        title: "Public link generated",
        description: "Your quote is now ready to share!",
      });
    } catch (error) {
      console.error('Error generating public link:', error);
      toast({
        title: "Error",
        description: "Failed to generate public link",
        variant: "destructive",
      });
    }
  };

  const copyPublicLink = () => {
    if (quote?.public_link_token) {
      const url = `${window.location.origin}/quote/${quote.public_link_token}`;
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "The shareable link has been copied to your clipboard",
      });
    }
  };

  if (!quote) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading quote...</p>
      </div>
    );
  }

  const nonLineItemElements = elements.filter(el => el.element_type !== 'line_item');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/quotes')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quotes
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{quote.title}</h1>
            <p className="text-gray-600">{quote.quote_number}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={viewQuote}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          {quote.public_link_token && quote.status === 'sent' ? (
            <Button variant="outline" onClick={copyPublicLink}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          ) : (
            <Button variant="outline" onClick={generatePublicLink}>
              <Share className="w-4 h-4 mr-2" />
              Create Link
            </Button>
          )}
          <Button onClick={() => toast({ title: "Saved", description: "Quote saved successfully" })}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Element Toolbar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add Elements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => addElement('text')}
              >
                <Type className="w-4 h-4 mr-2" />
                Text Block
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => addElement('image')}
              >
                <Image className="w-4 h-4 mr-2" />
                Image
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => addElement('line_item')}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Line Item
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => addElement('pricing_grid')}
              >
                <Grid className="w-4 h-4 mr-2" />
                Pricing Grid
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => addElement('spacer')}
              >
                <Minus className="w-4 h-4 mr-2" />
                Spacer
              </Button>
            </CardContent>
          </Card>

          {/* Element Properties */}
          {selectedElement && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Element Properties
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeElement(selectedElement)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ElementToolbar
                  element={elements.find(e => e.id === selectedElement)}
                  onUpdate={updateElementContent}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quote Builder Canvas */}
        <div className="lg:col-span-3 space-y-6">
          {/* Quote Header - Updated to only pass quote */}
          <QuoteHeader quote={quote} />

          {/* Investment Breakdown */}
          <InvestmentBreakdown
            elements={elements}
            onUpdateElement={updateElementContent}
            onRemoveElement={removeElement}
            onTotalChange={handleTotalChange}
          />

          {/* Other Elements */}
          {nonLineItemElements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Content</CardTitle>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="quote-elements">
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`space-y-4 min-h-[200px] p-4 rounded-lg border-2 border-dashed transition-colors ${
                          snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                        }`}
                      >
                        {nonLineItemElements.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <div className="mb-4">
                              <Plus className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            </div>
                            <p className="text-sm">Add text, images, or other content here</p>
                          </div>
                        ) : (
                          nonLineItemElements.map((element, index) => (
                            <Draggable key={element.id} draggableId={element.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`${
                                    snapshot.isDragging ? 'opacity-75' : ''
                                  } ${
                                    selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
                                  }`}
                                  onClick={() => setSelectedElement(element.id)}
                                >
                                  <QuoteElementRenderer
                                    element={element}
                                    isSelected={selectedElement === element.id}
                                    onUpdate={updateElementContent}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteBuilder;
