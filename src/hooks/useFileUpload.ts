import { useState } from 'react';
import { useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface FileUploadOptions {
  fileType: 'logo' | 'invoice_pdf' | 'quote_pdf' | 'attachment';
  relatedId?: string;
  onSuccess?: (fileId: string) => void;
  onError?: (error: Error) => void;
}

export const useFileUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const generateUploadUrl = useConvexMutation(api.files.generateUploadUrl);
  const storeFileMetadata = useConvexMutation(api.files.storeFileMetadata);

  const uploadFile = async (file: File, options: FileUploadOptions) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // Step 2: Upload the file
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error('Failed to upload file');
      }

      const { storageId } = await result.json();
      setUploadProgress(80);

      // Step 3: Store metadata
      const metadata = await storeFileMetadata({
        storageId,
        fileName: file.name,
        fileType: options.fileType,
        mimeType: file.type,
        fileSize: file.size,
        userId: user.id,
        relatedId: options.relatedId,
      });

      setUploadProgress(100);
      setIsUploading(false);

      toast({
        title: 'Upload successful',
        description: `${file.name} has been uploaded`,
      });

      options.onSuccess?.(metadata.id);
      return metadata;
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);

      const err = error as Error;
      toast({
        title: 'Upload failed',
        description: err.message,
        variant: 'destructive',
      });

      options.onError?.(err);
      throw error;
    }
  };

  return {
    uploadFile,
    isUploading,
    uploadProgress,
  };
};
