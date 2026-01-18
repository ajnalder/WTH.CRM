import { useEffect, useRef, useState } from 'react';
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface AiPromptSettings {
  id: string;
  user_id: string;
  base_prompt: string;
  created_at: string;
  updated_at: string;
}

export const useAiPromptSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const hasInitializedRef = useRef(false);

  const settingsData = useConvexQuery(
    api.aiSettings.get,
    user ? { userId: user.id } : undefined
  ) as AiPromptSettings | null | undefined;

  const upsertMutation = useConvexMutation(api.aiSettings.upsert);
  const resetMutation = useConvexMutation(api.aiSettings.resetToDefault);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    if (settingsData === null && user) {
      hasInitializedRef.current = true;
      resetMutation({ userId: user.id }).catch((error) => {
        console.error('Error initializing AI prompt settings:', error);
      });
    }
    if (settingsData) {
      hasInitializedRef.current = true;
    }
  }, [settingsData, user, resetMutation]);

  const updatePrompt = async (base_prompt: string) => {
    if (!user) throw new Error('Not authenticated');
    try {
      setIsUpdating(true);
      await upsertMutation({ userId: user.id, base_prompt });
      toast({ title: 'Saved', description: 'AI prompt updated successfully' });
    } catch (error) {
      console.error('Error updating AI prompt:', error);
      toast({ title: 'Error', description: 'Failed to update AI prompt', variant: 'destructive' });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const resetToDefault = async () => {
    if (!user) throw new Error('Not authenticated');
    try {
      setIsUpdating(true);
      await resetMutation({ userId: user.id });
      toast({ title: 'Reset', description: 'AI prompt reset to default' });
    } catch (error) {
      console.error('Error resetting AI prompt:', error);
      toast({ title: 'Error', description: 'Failed to reset AI prompt', variant: 'destructive' });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    settings: settingsData ?? null,
    isLoading: settingsData === undefined,
    isUpdating,
    updatePrompt,
    resetToDefault,
  };
};
