import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, File, X } from 'lucide-react';
import { useFileUpload, FileUploadOptions } from '@/hooks/useFileUpload';
import { Progress } from '@/components/ui/progress';

interface FileUploadProps {
  accept?: string;
  maxSizeMB?: number;
  fileType: FileUploadOptions['fileType'];
  relatedId?: string;
  onUploadComplete?: (fileId: string) => void;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost';
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept = '*/*',
  maxSizeMB = 10,
  fileType,
  relatedId,
  onUploadComplete,
  buttonText = 'Upload File',
  buttonVariant = 'default',
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadFile, isUploading, uploadProgress } = useFileUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      alert(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadFile(selectedFile, {
        fileType,
        relatedId,
        onSuccess: (fileId) => {
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          onUploadComplete?.(fileId);
        },
      });
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {!selectedFile && !isUploading && (
        <Button
          type="button"
          variant={buttonVariant}
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>
      )}

      {selectedFile && !isUploading && (
        <div className="border rounded-lg p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <File className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm truncate">{selectedFile.name}</span>
              <span className="text-xs text-gray-500 flex-shrink-0">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Button
            type="button"
            onClick={handleUpload}
            className="w-full"
            size="sm"
          >
            Upload
          </Button>
        </div>
      )}

      {isUploading && (
        <div className="border rounded-lg p-3 bg-blue-50">
          <div className="flex items-center gap-2 mb-2">
            <File className="w-4 h-4 text-blue-600" />
            <span className="text-sm">{selectedFile?.name}</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-gray-600 mt-2">Uploading... {uploadProgress}%</p>
        </div>
      )}
    </div>
  );
};
