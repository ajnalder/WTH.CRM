
import React, { useState } from 'react';
import { Edit, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useProjects } from '@/hooks/useProjects';

interface Project {
  id: string;
  description: string;
}

interface ProjectDescriptionProps {
  project: Project;
}

export const ProjectDescription: React.FC<ProjectDescriptionProps> = ({ project }) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(project.description || '');
  const { updateProject, isUpdating } = useProjects();
  
  const handleSaveDescription = () => {
    updateProject({ 
      projectId: project.id, 
      projectData: { description: editedDescription } 
    });
    setIsEditingDescription(false);
  };

  const handleCancelEdit = () => {
    setEditedDescription(project.description || '');
    setIsEditingDescription(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Project Description</CardTitle>
          {!isEditingDescription ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingDescription(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveDescription}
                disabled={isUpdating}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                disabled={isUpdating}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditingDescription ? (
          <Textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="min-h-[100px]"
            placeholder="Enter project description..."
            disabled={isUpdating}
          />
        ) : (
          <p className="text-gray-700 leading-relaxed">
            {project.description || 'No description provided'}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
