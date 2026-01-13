import { useMutation, useQuery } from 'convex/react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/integrations/convex/api';

export type ProjectNote = {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  remind_at?: string;
  reminder_status?: string;
  reminder_snoozed_until?: string;
  reminder_completed_at?: string;
};

export const useProjectNotes = (projectId?: string) => {
  const { user } = useAuth();

  const notes = useQuery(
    api.projectNotes.listByProject,
    user && projectId ? { projectId, userId: user.id } : undefined
  ) as ProjectNote[] | undefined;

  const createNoteMutation = useMutation(api.projectNotes.create);
  const completeReminderMutation = useMutation(api.projectNotes.completeReminder);
  const snoozeReminderMutation = useMutation(api.projectNotes.snoozeReminder);

  const createNote = async (content: string, remindAt?: string) => {
    if (!user || !projectId) throw new Error('User not authenticated');
    return createNoteMutation({ projectId, userId: user.id, content, remindAt });
  };

  const completeReminder = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    return completeReminderMutation({ id, userId: user.id });
  };

  const snoozeReminder = async (id: string, minutes: number) => {
    if (!user) throw new Error('User not authenticated');
    return snoozeReminderMutation({ id, userId: user.id, minutes });
  };

  return {
    notes: notes ?? [],
    createNote,
    completeReminder,
    snoozeReminder,
    isLoading: notes === undefined,
  };
};
