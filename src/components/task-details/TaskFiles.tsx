
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Download, FileText, Image } from 'lucide-react';
import { TaskFileUpload } from './TaskFileUpload';
import { useTaskFiles, type TaskFile } from '@/hooks/useTaskFiles';

interface TaskFilesProps {
  taskId: string;
}

export const TaskFiles: React.FC<TaskFilesProps> = ({ taskId }) => {
  const { 
    files, 
    isLoading, 
    uploadFile, 
    deleteFile, 
    isUploading, 
    isDeleting, 
    getFileUrl 
  } = useTaskFiles(taskId);

  const handleFileUpload = (file: File) => {
    uploadFile(file);
  };

  const handleFileDelete = (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      deleteFile(fileId);
    }
  };

  const isImage = (mimeType: string | null) => {
    return mimeType?.startsWith('image/') || false;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string | null) => {
    if (isImage(mimeType)) {
      return <Image className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Files</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TaskFileUpload onFileSelect={handleFileUpload} isUploading={isUploading} />
        
        {files.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No files uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                onDelete={handleFileDelete}
                isDeleting={isDeleting}
                getFileUrl={getFileUrl}
                isImage={isImage(file.mime_type)}
                getFileIcon={getFileIcon}
                formatFileSize={formatFileSize}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface FileItemProps {
  file: TaskFile;
  onDelete: (fileId: string) => void;
  isDeleting: boolean;
  getFileUrl: (filePath: string) => string;
  isImage: boolean;
  getFileIcon: (mimeType: string | null) => React.ReactNode;
  formatFileSize: (bytes: number | null) => string;
}

const FileItem: React.FC<FileItemProps> = ({
  file,
  onDelete,
  isDeleting,
  getFileUrl,
  isImage,
  getFileIcon,
  formatFileSize
}) => {
  const fileUrl = getFileUrl(file.file_path);

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {getFileIcon(file.mime_type)}
          <span className="text-sm font-medium truncate">{file.file_name}</span>
          <Badge variant="outline" className="text-xs">
            {formatFileSize(file.file_size)}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(fileUrl, '_blank')}
            className="h-8 w-8 p-0"
          >
            <Download className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(file.id)}
            disabled={isDeleting}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      {isImage && (
        <div className="mt-2">
          <Dialog>
            <DialogTrigger asChild>
              <img
                src={fileUrl}
                alt={file.file_name}
                className="max-w-full h-auto max-h-48 rounded border object-cover cursor-pointer hover:opacity-80 transition-opacity"
                loading="lazy"
              />
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] p-2">
              <div className="flex items-center justify-center">
                <img
                  src={fileUrl}
                  alt={file.file_name}
                  className="max-w-full max-h-[80vh] object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};
