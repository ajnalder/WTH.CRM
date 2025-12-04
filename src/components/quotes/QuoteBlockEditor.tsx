import React, { useState } from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { QuoteBlock } from '@/types/quote';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface QuoteBlockEditorProps {
  block: QuoteBlock;
  onUpdate: (updates: Partial<QuoteBlock>) => void;
  onDelete: () => void;
}

export const QuoteBlockEditor: React.FC<QuoteBlockEditorProps> = ({
  block,
  onUpdate,
  onDelete,
}) => {
  const [title, setTitle] = useState(block.title || '');
  const [content, setContent] = useState(block.content || '');
  const [imageUrl, setImageUrl] = useState(block.image_url || '');

  const handleTitleBlur = () => {
    if (title !== block.title) {
      onUpdate({ title });
    }
  };

  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const handleContentBlur = () => {
    if (content !== block.content) {
      onUpdate({ content });
    }
  };

  const handleImageUrlBlur = () => {
    if (imageUrl !== block.image_url) {
      onUpdate({ image_url: imageUrl });
    }
  };

  if (block.block_type === 'image') {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab mt-2" />
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onBlur={handleImageUrlBlur}
              />
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Block image"
                  className="max-h-48 rounded-lg object-contain"
                />
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <div className="flex items-start gap-2">
          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab mt-2" />
          <div className="flex-1 space-y-2">
            <Input
              placeholder="Section Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className="font-semibold"
            />
            <div onBlur={handleContentBlur}>
              <ReactQuill
                theme="snow"
                value={content}
                onChange={handleContentChange}
                className="bg-background"
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link'],
                    ['clean'],
                  ],
                }}
              />
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
