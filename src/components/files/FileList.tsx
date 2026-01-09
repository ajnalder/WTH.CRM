import React from 'react';
import { Button } from '@/components/ui/button';
import { File, Trash2, Download, Eye } from 'lucide-react';
import { useFiles, useFileUrl, FileMetadata } from '@/hooks/useFiles';

interface FileListProps {
  fileType?: string;
  relatedId?: string;
  showActions?: boolean;
}

export const FileList: React.FC<FileListProps> = ({
  fileType,
  relatedId,
  showActions = true,
}) => {
  const { files, isLoading, deleteFile } = useFiles(fileType, relatedId);

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500 p-4">Loading files...</div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-sm text-gray-500 p-4 text-center">
        No files uploaded yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <FileListItem
          key={file.id}
          file={file}
          showActions={showActions}
          onDelete={() => deleteFile(file.id)}
        />
      ))}
    </div>
  );
};

interface FileListItemProps {
  file: FileMetadata;
  showActions: boolean;
  onDelete: () => void;
}

const FileListItem: React.FC<FileListItemProps> = ({
  file,
  showActions,
  onDelete,
}) => {
  const fileUrl = useFileUrl(file.storage_id);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleView = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  const handleDownload = () => {
    if (fileUrl) {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <File className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.file_name}</p>
          <p className="text-xs text-gray-500">
            {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {showActions && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleView}
            title="View file"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Delete file"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
