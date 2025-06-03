
import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';

export const useProjectsPage = () => {
  const { projects, isLoading, error } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const handleProjectCreated = () => {
    // The useProjects hook will automatically refetch projects after creation
  };

  const filterProjects = () => {
    return projects.filter(project => {
      const matchesSearch = 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        project.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ((project as any).clients?.company && (project as any).clients.company.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    });
  };

  const sortProjects = (projectsToSort: typeof projects) => {
    return [...projectsToSort].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  };

  const filteredProjects = sortProjects(filterProjects());

  return {
    // Data
    projects: filteredProjects,
    isLoading,
    error,
    
    // State
    searchTerm,
    sortBy,
    viewMode,
    
    // Actions
    setSearchTerm,
    setSortBy,
    setViewMode,
    handleProjectCreated
  };
};
