import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface EmailImage {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  alt_text?: string;
  created_at: string;
  updated_at: string;
}

export const useEmailImages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['email-images'],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('email_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching email images:', error);
        throw error;
      }

      return data as EmailImage[];
    },
    enabled: !!user,
  });

  const uploadImage = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('email-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('email-images')
        .getPublicUrl(fileName);

      // Save metadata to database
      const { data, error } = await supabase
        .from('email_images')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
          mime_type: file.type,
        })
        .select()
        .single();

      if (error) throw error;

      return { ...data, publicUrl };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-images'] });
      toast.success('Image uploaded successfully');
    },
    onError: (error) => {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    },
  });

  const updateImage = useMutation({
    mutationFn: async ({ id, alt_text }: { id: string; alt_text: string }) => {
      const { data, error } = await supabase
        .from('email_images')
        .update({ alt_text })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-images'] });
      toast.success('Image updated successfully');
    },
    onError: (error) => {
      console.error('Error updating image:', error);
      toast.error('Failed to update image');
    },
  });

  const deleteImage = useMutation({
    mutationFn: async (image: EmailImage) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('email-images')
        .remove([image.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error } = await supabase
        .from('email_images')
        .delete()
        .eq('id', image.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-images'] });
      toast.success('Image deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    },
  });

  const getImageUrl = (filePath: string) => {
    const { data: { publicUrl } } = supabase.storage
      .from('email-images')
      .getPublicUrl(filePath);
    return publicUrl;
  };

  return {
    images,
    isLoading,
    uploadImage: uploadImage.mutate,
    updateImage: updateImage.mutate,
    deleteImage: deleteImage.mutate,
    isUploading: uploadImage.isPending,
    isUpdating: updateImage.isPending,
    isDeleting: deleteImage.isPending,
    getImageUrl,
  };
};