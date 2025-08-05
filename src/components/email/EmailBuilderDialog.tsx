import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { DraggableEmailComponent } from './DraggableEmailComponent';
import { ImageUploadDialog } from './ImageUploadDialog';
import { 
  Type, 
  Image, 
  AlignLeft, 
  AlignCenter, 
  Bold, 
  Italic,
  Link,
  Save,
  Eye,
  Upload
} from 'lucide-react';

interface EmailBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId?: string | null;
}

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

export const EmailBuilderDialog: React.FC<EmailBuilderDialogProps> = ({
  open,
  onOpenChange,
  campaignId,
}) => {
  const [components, setComponents] = useState<EmailComponent[]>([
    {
      id: '1',
      type: 'title',
      content: 'Your Email Title',
      styles: { fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }
    },
    {
      id: '2',
      type: 'text',
      content: 'This is your email content. You can edit this text and add more components below.',
      styles: { fontSize: '16px', lineHeight: '1.6' }
    }
  ]);

  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const addComponent = (type: EmailComponent['type']) => {
    const newComponent: EmailComponent = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type)
    };
    setComponents([...components, newComponent]);
    setSelectedComponent(newComponent.id);
  };

  const duplicateComponent = (componentId: string) => {
    const originalComponent = components.find(c => c.id === componentId);
    if (!originalComponent) return;

    const duplicatedComponent: EmailComponent = {
      ...originalComponent,
      id: `component-${Date.now()}`,
    };
    
    const originalIndex = components.findIndex(c => c.id === componentId);
    setComponents(prev => [
      ...prev.slice(0, originalIndex + 1),
      duplicatedComponent,
      ...prev.slice(originalIndex + 1),
    ]);
    setSelectedComponent(duplicatedComponent.id);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(components);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setComponents(items);
  };

  const handleImageSelect = (imageUrl: string, altText?: string) => {
    if (selectedComponent) {
      updateComponent(selectedComponent, { 
        content: imageUrl,
        styles: { ...components.find(c => c.id === selectedComponent)?.styles, alt: altText } 
      });
    } else {
      // Add new image component
      const newComponent: EmailComponent = {
        id: `component-${Date.now()}`,
        type: 'image',
        content: imageUrl,
        styles: { ...getDefaultStyles('image'), alt: altText },
      };
      setComponents(prev => [...prev, newComponent]);
      setSelectedComponent(newComponent.id);
    }
  };

  const getDefaultContent = (type: EmailComponent['type']): string => {
    switch (type) {
      case 'title': return 'New Title';
      case 'text': return 'Your text content goes here...';
      case 'image': return 'https://via.placeholder.com/600x200';
      case 'button': return 'Click Here';
      case 'divider': return '';
      case 'footer': return 'Unsubscribe | Company Name';
      default: return '';
    }
  };

  const getDefaultStyles = (type: EmailComponent['type']) => {
    switch (type) {
      case 'title': 
        return { fontSize: '24px', fontWeight: 'bold', textAlign: 'center' as const };
      case 'text': 
        return { fontSize: '16px', textAlign: 'left' as const };
      case 'button': 
        return { 
          backgroundColor: '#3b82f6', 
          color: '#ffffff', 
          padding: '12px 24px',
          textAlign: 'center' as const
        };
      case 'footer': 
        return { fontSize: '12px', textAlign: 'center' as const, color: '#999999' };
      case 'image':
        return { textAlign: 'center' as const };
      default: 
        return {};
    }
  };

  const updateComponent = (id: string, updates: Partial<EmailComponent>) => {
    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ));
  };

  const removeComponent = (id: string) => {
    setComponents(components.filter(comp => comp.id !== id));
    if (selectedComponent === id) {
      setSelectedComponent(null);
    }
  };

  const generateHTML = () => {
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        ${components.map(comp => {
          const styles = Object.entries(comp.styles || {})
            .filter(([key]) => key !== 'alt')
            .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
            .join('; ');

          switch (comp.type) {
            case 'title':
              return `<h1 style="${styles}">${comp.content}</h1>`;
            case 'text':
              return `<p style="${styles}">${comp.content}</p>`;
            case 'image':
              return `<img src="${comp.content}" style="max-width: 100%; ${styles}" alt="${comp.styles?.alt || 'Email Image'}" />`;
            case 'button':
              return `<div style="text-align: center; margin: 20px 0;"><a href="#" style="display: inline-block; text-decoration: none; border-radius: 4px; ${styles}">${comp.content}</a></div>`;
            case 'divider':
              return `<hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />`;
            case 'footer':
              return `<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; ${styles}">${comp.content}</div>`;
            default:
              return '';
          }
        }).join('')}
      </div>
    `;
  };

  const selectedComp = components.find(comp => comp.id === selectedComponent);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Email Builder</DialogTitle>
          <DialogDescription>
            Drag and drop components to build your email
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-80 border-r bg-gray-50 p-4 space-y-4 overflow-y-auto">
            <div>
              <h3 className="font-semibold mb-3">Components</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => addComponent('title')}
                  className="justify-start gap-2"
                >
                  <Type size={16} />
                  Title
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => addComponent('text')}
                  className="justify-start gap-2"
                >
                  <AlignLeft size={16} />
                  Text
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setImageDialogOpen(true)}
                  className="justify-start gap-2"
                >
                  <Image size={16} />
                  Image
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => addComponent('button')}
                  className="justify-start gap-2"
                >
                  <Link size={16} />
                  Button
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => addComponent('divider')}
                  className="justify-start gap-2"
                >
                  —
                  Divider
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => addComponent('footer')}
                  className="justify-start gap-2"
                >
                  📄
                  Footer
                </Button>
              </div>
              
              <div className="mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setImageDialogOpen(true)}
                  className="w-full justify-start gap-2"
                >
                  <Upload size={16} />
                  Upload Image
                </Button>
              </div>
            </div>

            <Separator />

            {/* Properties Panel */}
            {selectedComp && (
              <div className="space-y-4">
                <h3 className="font-semibold">Properties</h3>
                
                <div>
                  <Label>Content</Label>
                  {selectedComp.type === 'text' ? (
                    <Textarea
                      value={selectedComp.content}
                      onChange={(e) => updateComponent(selectedComp.id, { content: e.target.value })}
                      rows={3}
                    />
                  ) : (
                    <Input
                      value={selectedComp.content}
                      onChange={(e) => updateComponent(selectedComp.id, { content: e.target.value })}
                    />
                  )}
                </div>

                {selectedComp.type === 'image' && (
                  <div>
                    <Label>Alt Text</Label>
                    <Input
                      value={selectedComp.styles?.alt || ''}
                      onChange={(e) => updateComponent(selectedComp.id, { 
                        styles: { ...selectedComp.styles, alt: e.target.value }
                      })}
                      placeholder="Describe the image..."
                    />
                  </div>
                )}

                <div>
                  <Label>Text Align</Label>
                  <div className="flex gap-1 mt-1">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <Button
                        key={align}
                        variant={selectedComp.styles?.textAlign === align ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateComponent(selectedComp.id, { 
                          styles: { ...selectedComp.styles, textAlign: align }
                        })}
                      >
                        <AlignLeft size={14} />
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Font Size</Label>
                  <Input
                    value={selectedComp.styles?.fontSize || '16px'}
                    onChange={(e) => updateComponent(selectedComp.id, { 
                      styles: { ...selectedComp.styles, fontSize: e.target.value }
                    })}
                    placeholder="16px"
                  />
                </div>

                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => removeComponent(selectedComp.id)}
                  className="w-full"
                >
                  Remove Component
                </Button>
              </div>
            )}
          </div>

          {/* Main Editor */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Email Preview</h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  <Eye size={16} className="mr-2" />
                  {previewMode ? 'Edit' : 'Preview'}
                </Button>
                <Button size="sm">
                  <Save size={16} className="mr-2" />
                  Save
                </Button>
              </div>
            </div>

            <Card className="h-[500px] overflow-y-auto">
              <CardContent className="p-6">
                {previewMode ? (
                  <div dangerouslySetInnerHTML={{ __html: generateHTML() }} />
                ) : (
                  <div className="max-w-[600px] mx-auto">
                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="email-components">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-4 min-h-96"
                          >
                            {components.length === 0 ? (
                              <div className="text-center py-12 text-gray-500">
                                <Image className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                <p>Start building your email by adding components from the sidebar</p>
                              </div>
                            ) : (
                              components.map((component, index) => (
                                <DraggableEmailComponent
                                  key={component.id}
                                  component={component}
                                  index={index}
                                  isSelected={selectedComponent === component.id}
                                  onSelect={() => setSelectedComponent(component.id)}
                                  onDelete={() => removeComponent(component.id)}
                                  onDuplicate={() => duplicateComponent(component.id)}
                                />
                              ))
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>

      <ImageUploadDialog
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        onSelectImage={handleImageSelect}
      />
    </Dialog>
  );
};