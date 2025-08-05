import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2, Copy } from 'lucide-react';

interface EmailComponent {
  id: string;
  type: 'title' | 'text' | 'image' | 'button' | 'divider' | 'footer';
  content: string;
  styles?: {
    fontSize?: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
    color?: string;
    backgroundColor?: string;
    padding?: string;
    margin?: string;
    lineHeight?: string;
    alt?: string;
  };
}

interface DraggableEmailComponentProps {
  component: EmailComponent;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export const DraggableEmailComponent: React.FC<DraggableEmailComponentProps> = ({
  component,
  index,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}) => {
  const renderComponent = () => {
    const { type, content, styles = {} } = component;
    
    switch (type) {
      case 'title':
        return (
          <h1 style={styles} className="m-0">
            {content || 'Enter your title here...'}
          </h1>
        );
      case 'text':
        return (
          <p style={styles} className="m-0">
            {content || 'Enter your text here...'}
          </p>
        );
      case 'image':
        return (
          <img
            src={content || 'https://via.placeholder.com/300x200?text=Image'}
            alt={styles.alt || 'Email content'}
            style={{ maxWidth: '100%', height: 'auto', ...styles }}
          />
        );
      case 'button':
        return (
          <button
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              ...styles,
            }}
          >
            {content || 'Button Text'}
          </button>
        );
      case 'divider':
        return (
          <hr
            style={{
              border: 'none',
              height: '1px',
              backgroundColor: '#e5e7eb',
              margin: '20px 0',
              ...styles,
            }}
          />
        );
      case 'footer':
        return (
          <div style={styles} className="m-0">
            {content || 'Footer content...'}
          </div>
        );
      default:
        return <div>Unknown component type</div>;
    }
  };

  return (
    <Draggable draggableId={component.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`relative group transition-all ${
            isSelected 
              ? 'ring-2 ring-primary shadow-md' 
              : 'hover:shadow-sm'
          } ${
            snapshot.isDragging ? 'shadow-lg rotate-1' : ''
          }`}
          onClick={onSelect}
        >
          {/* Drag Handle */}
          <div
            {...provided.dragHandleProps}
            className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10 h-6 w-6 flex items-center justify-center bg-white/90 hover:bg-white shadow-sm rounded border"
          >
            <GripVertical className="h-3 w-3" />
          </div>

          {/* Action Buttons */}
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 z-10">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 bg-white/90 hover:bg-white shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 bg-white/90 hover:bg-red-50 shadow-sm text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>

          {/* Component Order Badge */}
          <div className="absolute left-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="inline-flex items-center justify-center h-5 w-5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
              {index + 1}
            </span>
          </div>

          {/* Component Content */}
          <div className="p-4">
            {renderComponent()}
          </div>
        </Card>
      )}
    </Draggable>
  );
};