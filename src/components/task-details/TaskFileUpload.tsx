
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface TaskFileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
}

export const TaskFileUpload: React.FC<TaskFileUploadProps> = ({
  onFileSelect,
  isUploading = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      // Reset the input so the same file can be selected again
      event.target.value = '';
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isUploading}
        variant="outline"
        size="sm"
        className="w-full"
      >
        <Upload className="w-4 h-4 mr-2" />
        {isUploading ? 'Uploading...' : 'Upload File'}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,application/pdf,.doc,.docx,.txt"
      />
    </>
  );
};
