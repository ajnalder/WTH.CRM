
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface TaskPlanningData {
  id: string;
  task_id: string;
  allocated_minutes: number;
  order_index: number;
  is_scheduled: boolean;
  scheduled_date: string;
}

export const useTaskPlanningData = (selectedDate: Date = new Date()) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const dateString = selectedDate.toISOString().split('T')[0];

  const taskPlanningData = useConvexQuery(
    api.taskPlanning.listByDate,
    user ? { userId: user.id, date: dateString } : undefined
  ) as TaskPlanningData[] | undefined;

  const upsertTaskPlanningMutation = useConvexMutation(api.taskPlanning.upsert);

  const deleteTaskPlanningMutation = useConvexMutation(api.taskPlanning.remove);

  return {
    taskPlanningData: taskPlanningData ?? [],
    isLoading: taskPlanningData === undefined,
    upsertTaskPlanning: (data: Omit<TaskPlanningData, 'id'>) => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      return upsertTaskPlanningMutation({
        ...data,
        userId: user.id,
      }).catch((error) => {
        console.error('Error saving task planning data:', error);
        toast({
          title: "Error",
          description: "Failed to save task planning data",
          variant: "destructive",
        });
        throw error;
      });
    },
    deleteTaskPlanning: (taskId: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      return deleteTaskPlanningMutation({
        task_id: taskId,
        date: dateString,
        userId: user.id,
      }).catch((error) => {
        console.error('Error deleting task planning data:', error);
        toast({
          title: "Error",
          description: "Failed to remove task from schedule",
          variant: "destructive",
        });
        throw error;
      });
    },
    isUpdating: upsertTaskPlanningMutation.isPending || deleteTaskPlanningMutation.isPending,
  };
};
