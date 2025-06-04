
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/project';
import { transformProjectData } from '@/utils/projectTransform';

export const useProjectQueries = (clientId?: string) => {
  return useQuery({
    queryKey: clientId ? ['projects', clientId] : ['projects'],
    queryFn: async () => {
      console.log('Fetching projects', clientId ? `for client ${clientId}` : 'for all clients');
      
      let query = supabase
        .from('projects')
        .select(`
          *,
          clients!inner(
            id,
            company
          ),
          project_team_members(
            user_id,
            profiles!inner(
              id,
              full_name,
              email,
              avatar_url
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }

      const transformedData = transformProjectData(data);
      console.log('Projects fetched:', transformedData);
      return transformedData as Project[];
    },
  });
};
