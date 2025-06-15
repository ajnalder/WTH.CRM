
import React from 'react';
import { QuoteElement, TextElementContent, ImageElementContent, LineItemContent, PricingGridContent, SpacerContent } from '@/types/quoteTypes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface QuoteElementRendererProps {
  element: QuoteElement;
  isSelected: boolean;
  onUpdate: (elementId: string, content: any) => void;
  isEditable?: boolean;
}

export const QuoteElementRenderer: React.FC<QuoteElementRendererProps> = ({
  element,
  isSelected,
  onUpdate,
  isEditable = true
}) => {
  const handleContentChange = (newContent: Partial<any>) => {
    onUpdate(element.id, { ...element.content, ...newContent });
  };

  const renderTextElement = (content: TextElementContent) => {
    const fontSize = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
      xl: 'text-xl'
    }[content.fontSize || 'medium'];

    const fontWeight = content.fontWeight === 'bold' ? 'font-bold' : 'font-normal';
    const textAlign = `text-${content.textAlign || 'left'}`;

    if (isEditable && isSelected) {
      return (
        <Textarea
          value={content.text}
          onChange={(e) => handleContentChange({ text: e.target.value })}
          className={`${fontSize} ${fontWeight} ${textAlign} border-none resize-none`}
          style={{ color: content.color }}
        />
      );
    }

    return (
      <div 
        className={`${fontSize} ${fontWeight} ${textAlign} p-4`}
        style={{ color: content.color }}
      >
        {content.text || 'Click to edit text'}
      </div>
    );
  };

  const renderImageElement = (content: ImageElementContent) => {
    const alignment = `text-${content.alignment || 'center'}`;

    if (!content.url) {
      return (
        <div className={`${alignment} p-8 border-2 border-dashed border-gray-300 rounded-lg`}>
          <div className="text-gray-500">
            <div className="text-4xl mb-2">📷</div>
            <p>Click to add image URL</p>
          </div>
        </div>
      );
    }

    return (
      <div className={alignment}>
        <img
          src={content.url}
          alt={content.alt || 'Quote image'}
          className="max-w-full h-auto rounded-lg"
          style={{
            width: content.width ? `${content.width}px` : 'auto',
            height: content.height ? `${content.height}px` : 'auto'
          }}
        />
      </div>
    );
  };

  const renderLineItemElement = (content: LineItemContent) => {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="grid grid-cols-4 gap-4 items-center">
          <div className="col-span-2">
            {isEditable && isSelected ? (
              <Input
                value={content.description}
                onChange={(e) => handleContentChange({ 
                  description: e.target.value,
                  amount: content.quantity * content.rate
                })}
                placeholder="Description"
              />
            ) : (
              <span>{content.description}</span>
            )}
          </div>
          <div className="text-center">
            {isEditable && isSelected ? (
              <Input
                type="number"
                value={content.quantity}
                onChange={(e) => {
                  const quantity = parseFloat(e.target.value) || 0;
                  handleContentChange({ 
                    quantity,
                    amount: quantity * content.rate
                  });
                }}
                placeholder="Qty"
              />
            ) : (
              <span>{content.quantity}</span>
            )}
          </div>
          <div className="text-right">
            {isEditable && isSelected ? (
              <Input
                type="number"
                value={content.rate}
                onChange={(e) => {
                  const rate = parseFloat(e.target.value) || 0;
                  handleContentChange({ 
                    rate,
                    amount: content.quantity * rate
                  });
                }}
                placeholder="Rate"
              />
            ) : (
              <span>${content.amount?.toFixed(2) || '0.00'}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPricingGridElement = (content: PricingGridContent) => {
    return (
      <div className="space-y-4">
        {content.title && (
          <h3 className="text-xl font-bold text-center">{content.title}</h3>
        )}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                {content.columns?.map((column, index) => (
                  <th key={index} className="border border-gray-300 p-3 text-left font-semibold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.rows?.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3 font-medium">{row.label}</td>
                  {row.values.map((value, valueIndex) => (
                    <td key={valueIndex} className="border border-gray-300 p-3 text-center">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSpacerElement = (content: SpacerContent) => {
    return (
      <div 
        style={{ height: `${content.height || 20}px` }}
        className="w-full border-t border-dashed border-gray-300"
      />
    );
  };

  const renderElement = () => {
    switch (element.element_type) {
      case 'text':
        return renderTextElement(element.content as TextElementContent);
      case 'image':
        return renderImageElement(element.content as ImageElementContent);
      case 'line_item':
        return renderLineItemElement(element.content as LineItemContent);
      case 'pricing_grid':
        return renderPricingGridElement(element.content as PricingGridContent);
      case 'spacer':
        return renderSpacerElement(element.content as SpacerContent);
      default:
        return <div>Unknown element type</div>;
    }
  };

  return (
    <div 
      className={`transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      } ${isEditable ? 'cursor-pointer hover:shadow-sm' : ''}`}
    >
      {renderElement()}
    </div>
  );
};
