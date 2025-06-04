
import { Project } from '@/types/project';

export const transformProjectData = (data: any[]): Project[] => {
  const gradients = [
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-purple-400 to-purple-600',
    'from-red-400 to-red-600',
    'from-yellow-400 to-yellow-600',
    'from-pink-400 to-pink-600',
    'from-indigo-400 to-indigo-600',
    'from-teal-400 to-teal-600',
  ];

  return data?.map((project, index) => {
    const team_members = project.project_team_members?.map((ptm: any, idx: number) => {
      const profile = ptm.profiles;
      const name = profile?.full_name || profile?.email || 'Unknown User';
      const initials = profile?.full_name 
        ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : (profile?.email || 'UN').slice(0, 2).toUpperCase();

      return {
        id: profile?.id || '',
        name,
        role: 'Team Member',
        email: profile?.email || '',
        avatar: initials,
        gradient: gradients[idx % gradients.length],
      };
    }) || [];

    return {
      ...project,
      client_name: (project as any).clients?.company || 'Unknown Client',
      team_members
    };
  }) || [];
};
