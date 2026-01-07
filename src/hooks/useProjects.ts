
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export interface Project {
  id: string;
  client_id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  start_date: string | null;
  due_date: string | null;
  budget: number | null;
  progress: number;
  is_retainer: boolean;
  is_billable: boolean;
  created_at: string;
  updated_at: string;
  client_name?: string; // Add client name to the interface
  team_members?: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
    avatar: string;
    gradient: string;
  }>;
}

export interface CreateProjectData {
  client_id: string;
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  start_date?: string;
  due_date?: string | null;
  budget?: number;
  progress?: number;
  is_retainer?: boolean;
  is_billable?: boolean;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: string;
  priority?: string;
  start_date?: string;
  due_date?: string;
  budget?: number;
  progress?: number;
  is_retainer?: boolean;
  is_billable?: boolean;
}

export const useProjects = (clientId?: string) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const projectsData = useConvexQuery(
    api.projects.list,
    user ? { userId: user.id, clientId } : undefined
  );
  const isLoading = projectsData === undefined;
  const projects = projectsData ?? [];
  const error = null;

  const createProjectMutation = useConvexMutation(api.projects.create);
  const updateProjectMutation = useConvexMutation(api.projects.update);
  const deleteProjectMutation = useConvexMutation(api.projects.remove);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const createProject = async (projectData: CreateProjectData) => {
    if (!user) throw new Error('User not authenticated');
    try {
      console.log('createProject', { userId: user.id, projectData });
      setIsCreating(true);
      await createProjectMutation({
        userId: user.id,
        ...projectData,
      });
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create project",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updateProject = async ({ projectId, projectData }: { projectId: string; projectData: UpdateProjectData }) => {
    if (!user) throw new Error('User not authenticated');
    try {
      setIsUpdating(true);
      await updateProjectMutation({ id: projectId, userId: user.id, updates: projectData });
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update project",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!user) throw new Error('User not authenticated');
    try {
      setIsDeleting(true);
      await deleteProjectMutation({ id: projectId, userId: user.id });
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete project",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    projects,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    isCreating,
    isUpdating,
    isDeleting,
  };
};
