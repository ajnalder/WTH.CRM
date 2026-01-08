import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useIdeas = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const ideasData = useConvexQuery(
    api.ideas.list,
    user ? { userId: user.id } : undefined
  );

  const ideas = ideasData ?? [];
  const isLoading = ideasData === undefined;
  const error = null;

  const createIdeaMutation = useConvexMutation(api.ideas.create);
  const updateIdeaMutation = useConvexMutation(api.ideas.update);
  const deleteIdeaMutation = useConvexMutation(api.ideas.remove);

  const createIdea = {
    mutateAsync: async (ideaData: {
      title: string;
      content?: string;
      priority: string;
      status: string;
      tags?: string[];
    }) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const data = await createIdeaMutation({
          userId: user.id,
          ...ideaData,
        });
        toast({
          title: "Success",
          description: "Idea created successfully!",
        });
        return data;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create idea. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
  };

  const updateIdea = {
    mutateAsync: async ({ id, updates }: { id: string; updates: any }) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const data = await updateIdeaMutation({ id, userId: user.id, updates });
        toast({
          title: "Success",
          description: "Idea updated successfully!",
        });
        return data;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update idea. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
  };

  const deleteIdea = {
    mutateAsync: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      try {
        await deleteIdeaMutation({ id, userId: user.id });
        toast({
          title: "Success",
          description: "Idea deleted successfully!",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete idea. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
  };

  return {
    ideas,
    isLoading,
    error,
    createIdea,
    updateIdea,
    deleteIdea,
  };
};
