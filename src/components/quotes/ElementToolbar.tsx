
import React from 'react';
import { QuoteElement, TextElementContent, ImageElementContent, LineItemContent, SpacerContent } from '@/types/quoteTypes';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface ElementToolbarProps {
  element?: QuoteElement;
  onUpdate: (elementId: string, content: any) => void;
}

export const ElementToolbar: React.FC<ElementToolbarProps> = ({ element, onUpdate }) => {
  if (!element) return null;

  const handleContentChange = (newContent: Partial<any>) => {
    onUpdate(element.id, { ...element.content, ...newContent });
  };

  const renderTextControls = (content: TextElementContent) => (
    <div className="space-y-4">
      <div>
        <Label>Font Size</Label>
        <Select value={content.fontSize || 'medium'} onValueChange={(value) => handleContentChange({ fontSize: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
            <SelectItem value="xl">Extra Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Font Weight</Label>
        <Select value={content.fontWeight || 'normal'} onValueChange={(value) => handleContentChange({ fontWeight: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="bold">Bold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Text Alignment</Label>
        <Select value={content.textAlign || 'left'} onValueChange={(value) => handleContentChange({ textAlign: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Text Color</Label>
        <Input
          type="color"
          value={content.color || '#000000'}
          onChange={(e) => handleContentChange({ color: e.target.value })}
        />
      </div>
    </div>
  );

  const renderImageControls = (content: ImageElementContent) => (
    <div className="space-y-4">
      <div>
        <Label>Image URL</Label>
        <Input
          value={content.url || ''}
          onChange={(e) => handleContentChange({ url: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div>
        <Label>Alt Text</Label>
        <Input
          value={content.alt || ''}
          onChange={(e) => handleContentChange({ alt: e.target.value })}
          placeholder="Image description"
        />
      </div>

      <div>
        <Label>Alignment</Label>
        <Select value={content.alignment || 'center'} onValueChange={(value) => handleContentChange({ alignment: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Width (px)</Label>
          <Input
            type="number"
            value={content.width || ''}
            onChange={(e) => handleContentChange({ width: parseInt(e.target.value) || undefined })}
            placeholder="Auto"
          />
        </div>
        <div>
          <Label>Height (px)</Label>
          <Input
            type="number"
            value={content.height || ''}
            onChange={(e) => handleContentChange({ height: parseInt(e.target.value) || undefined })}
            placeholder="Auto"
          />
        </div>
      </div>
    </div>
  );

  const renderLineItemControls = (content: LineItemContent) => (
    <div className="space-y-4">
      <div>
        <Label>Description</Label>
        <Input
          value={content.description || ''}
          onChange={(e) => handleContentChange({ description: e.target.value })}
          placeholder="Item description"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Quantity</Label>
          <Input
            type="number"
            value={content.quantity || 0}
            onChange={(e) => {
              const quantity = parseFloat(e.target.value) || 0;
              handleContentChange({ 
                quantity,
                amount: quantity * (content.rate || 0)
              });
            }}
          />
        </div>
        <div>
          <Label>Rate ($)</Label>
          <Input
            type="number"
            step="0.01"
            value={content.rate || 0}
            onChange={(e) => {
              const rate = parseFloat(e.target.value) || 0;
              handleContentChange({ 
                rate,
                amount: (content.quantity || 0) * rate
              });
            }}
          />
        </div>
      </div>

      <div>
        <Label>Amount</Label>
        <Input
          value={`$${content.amount?.toFixed(2) || '0.00'}`}
          disabled
        />
      </div>
    </div>
  );

  const renderSpacerControls = (content: SpacerContent) => (
    <div>
      <Label>Height (px)</Label>
      <Input
        type="number"
        value={content.height || 20}
        onChange={(e) => handleContentChange({ height: parseInt(e.target.value) || 20 })}
      />
    </div>
  );

  const renderControls = () => {
    switch (element.element_type) {
      case 'text':
        return renderTextControls(element.content as TextElementContent);
      case 'image':
        return renderImageControls(element.content as ImageElementContent);
      case 'line_item':
        return renderLineItemControls(element.content as LineItemContent);
      case 'spacer':
        return renderSpacerControls(element.content as SpacerContent);
      case 'pricing_grid':
        return <div className="text-sm text-gray-500">Use the editor to modify pricing grid content</div>;
      default:
        return <div>No controls available</div>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium capitalize">{element.element_type.replace('_', ' ')} Element</div>
      {renderControls()}
    </div>
  );
};
