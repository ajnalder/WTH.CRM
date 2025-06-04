
import { useProjectQueries } from '@/hooks/projects/useProjectQueries';
import { useProjectMutations } from '@/hooks/projects/useProjectMutations';

export const useProjects = (clientId?: string) => {
  const {
    data: projects = [],
    isLoading,
    error
  } = useProjectQueries(clientId);

  const mutations = useProjectMutations();

  return {
    projects,
    isLoading,
    error,
    ...mutations,
  };
};

// Re-export types for backward compatibility
export type { Project, CreateProjectData, UpdateProjectData } from '@/types/project';
