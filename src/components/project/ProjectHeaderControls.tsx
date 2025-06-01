
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

  const handleBillableToggle = (checked: boolean) => {
    updateProject({
      projectId: project.id,
      projectData: { is_billable: checked }
    });
  };

  const handleRetainerToggle = (checked: boolean) => {
    updateProject({
      projectId: project.id,
      projectData: { is_retainer: checked }
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex items-center space-x-3">
            <Label htmlFor="retainer-toggle" className="text-sm font-medium">
              Retainer Project
            </Label>
            <Switch
              id="retainer-toggle"
              checked={project.isRetainer}
              onCheckedChange={handleRetainerToggle}
            />
            {project.isRetainer && (
              <Badge variant="secondary" className="ml-2">
                Ongoing
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <Label htmlFor="billable-toggle" className="text-sm font-medium">
              Billable
            </Label>
            <Switch
              id="billable-toggle"
              checked={project.isBillable}
              onCheckedChange={handleBillableToggle}
            />
            {project.isBillable && (
              <Badge variant="default" className="ml-2">
                Billable
              </Badge>
            )}
            {!project.isBillable && (
              <Badge variant="outline" className="ml-2">
                Non-billable
              </Badge>
            )}
          </div>
        </div>
        
        {project.isRetainer && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              This is an ongoing retainer project. Tasks and work are performed on a recurring basis 
              as part of the client's retainer agreement.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
