
import React, { useState } from 'react';
import { Edit, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface TaskDropboxUrlEditorProps {
  currentDropboxUrl: string | null;
  onDropboxUrlUpdate: (url: string | null) => void;
  isUpdating: boolean;
}

export const TaskDropboxUrlEditor: React.FC<TaskDropboxUrlEditorProps> = ({
  currentDropboxUrl,
  onDropboxUrlUpdate,
  isUpdating
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(currentDropboxUrl || '');

  const handleSave = () => {
    const trimmedValue = inputValue.trim();
    onDropboxUrlUpdate(trimmedValue || null);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setInputValue(currentDropboxUrl || '');
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue('');
    onDropboxUrlUpdate(null);
    setIsOpen(false);
  };

  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-2">Dropbox Files</h3>
      <div className="flex items-center gap-2">
        {currentDropboxUrl ? (
          <a
            href={currentDropboxUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
          >
            View Files <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <p className="text-gray-600 text-sm">No files linked</p>
        )}
        
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              disabled={isUpdating}
            >
              <Edit className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Dropbox URL</label>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="https://dropbox.com/..."
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isUpdating}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                {currentDropboxUrl && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleClear}
                    disabled={isUpdating}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
