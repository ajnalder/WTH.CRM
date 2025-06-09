
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';

interface ProjectHeaderControlsProps {
  project: {
    id: string;
    isRetainer: boolean;
    isBillable: boolean;
  };
}

export const ProjectHeaderControls: React.FC<ProjectHeaderControlsProps> = ({ project }) => {
  const { updateProject } = useProjects();
  const { toast } = useToast();

  const handleToggle = (checked: boolean) => {
    // When checked (true) = Retainer mode
    // When not checked (false) = Billable mode
    updateProject({
      projectId: project.id,
      projectData: { 
        is_retainer: checked,
        is_billable: !checked
      }
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="project-type-toggle" className="text-sm font-medium">
              Project Type
            </Label>
            
            {project.isRetainer ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Ongoing
              </Badge>
            ) : (
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                Billable
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm ${!project.isRetainer ? 'font-medium text-blue-600' : 'text-gray-500'}`}>
              Billable
            </span>
            <Switch
              id="project-type-toggle"
              checked={project.isRetainer}
              onCheckedChange={handleToggle}
              className="data-[state=checked]:bg-green-600"
            />
            <span className={`text-sm ${project.isRetainer ? 'font-medium text-green-600' : 'text-gray-500'}`}>
              Retainer
            </span>
          </div>
        </div>
        
        {project.isRetainer && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              This is an ongoing retainer project. Tasks and work are performed on a recurring basis 
              as part of the client's retainer agreement.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
