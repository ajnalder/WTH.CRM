
import { useState } from 'react';
import { useAction, useMutation as useConvexMutation, useQuery as useConvexQuery } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface TaskFile {
  id: string;
  task_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size?: number | null;
  mime_type?: string | null;
  created_at: string;
  url?: string | null;
}

export const useTaskFiles = (taskId: string) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const list = useConvexQuery(
    api.taskFiles.listByTask,
    user && taskId ? { taskId, userId: user.id } : undefined
  ) as TaskFile[] | undefined;

  const uploadAction = useAction(api.taskFiles.upload);
  const deleteMutation = useConvexMutation(api.taskFiles.remove);

  const uploadFile = async (file: File) => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    try {
      setIsUploading(true);
      const buffer = await file.arrayBuffer();
      await uploadAction({
        taskId,
        userId: user.id,
        file: new Uint8Array(buffer),
        fileName: file.name,
        mimeType: file.type,
      });
      toast({ title: "Success", description: "File uploaded successfully" });
    } catch (error) {
      console.error('Upload file error:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    try {
      await deleteMutation({ id: fileId, userId: user.id });
      toast({ title: "Success", description: "File deleted successfully" });
    } catch (error) {
      console.error('Delete file error:', error);
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    files: list ?? [],
    isLoading: list === undefined,
    error: null,
    uploadFile,
    deleteFile,
    isUploading,
    isDeleting: deleteMutation.isPending,
  };
};
