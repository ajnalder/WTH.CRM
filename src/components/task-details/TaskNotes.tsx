
import React, { useState, useCallback, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaskNotesProps {
  taskId: string;
  initialNotes?: string | null;
  onSave: (notes: string) => void;
  isSaving?: boolean;
}

export const TaskNotes: React.FC<TaskNotesProps> = ({
  taskId,
  initialNotes,
  onSave,
  isSaving = false
}) => {
  const [notes, setNotes] = useState(initialNotes || '');
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  // Update notes when initialNotes changes
  useEffect(() => {
    setNotes(initialNotes || '');
    setHasChanges(false);
  }, [initialNotes]);

  const handleNotesChange = useCallback((value: string) => {
    setNotes(value);
    setHasChanges(value !== (initialNotes || ''));
  }, [initialNotes]);

  const handleSave = useCallback(() => {
    if (!hasChanges) return;
    
    onSave(notes);
    setHasChanges(false);
    
    toast({
      title: "Success",
      description: "Notes saved successfully",
    });
  }, [notes, hasChanges, onSave, toast]);

  // Auto-save after 3 seconds of inactivity
  useEffect(() => {
    if (!hasChanges) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 3000);

    return () => clearTimeout(timer);
  }, [notes, hasChanges, handleSave]);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'blockquote', 'code-block', 'link'
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Task Notes</CardTitle>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-sm text-orange-600">Unsaved changes</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="min-h-[200px]">
          <ReactQuill
            theme="snow"
            value={notes}
            onChange={handleNotesChange}
            modules={modules}
            formats={formats}
            placeholder="Add your notes here... You can format text, create lists, and more."
            className="bg-white"
          />
        </div>
        {hasChanges && (
          <p className="text-xs text-gray-500 mt-2">
            Notes will auto-save after 3 seconds of inactivity
          </p>
        )}
      </CardContent>
    </Card>
  );
};
