import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface FileMetadata {
  id: string;
  storage_id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  related_id?: string;
  created_at: string;
}

export const useFiles = (fileType?: string, relatedId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const shouldFetch = Boolean(user);
  const filesData = useConvexQuery(
    api.files.listFiles,
    shouldFetch
      ? {
          userId: user!.id,
          fileType,
          relatedId,
        }
      : undefined
  ) as FileMetadata[] | undefined;

  const files = shouldFetch ? filesData ?? [] : [];
  const isLoading = shouldFetch ? filesData === undefined : false;

  const deleteFileMutation = useConvexMutation(api.files.deleteFile);

  const deleteFile = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await deleteFileMutation({ id, userId: user.id });
      toast({
        title: 'File deleted',
        description: 'File has been successfully deleted',
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    files,
    isLoading,
    deleteFile,
  };
};

export const useFileUrl = (storageId?: string) => {
  const fileUrl = useConvexQuery(
    api.files.getFileUrl,
    storageId ? { storageId } : undefined
  );

  return fileUrl;
};
