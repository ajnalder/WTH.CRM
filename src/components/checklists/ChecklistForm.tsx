
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import type { ChecklistTemplate, ClientChecklist } from '@/types/checklist';
import { useChecklists } from '@/hooks/useChecklists';

interface ChecklistFormProps {
  template: ChecklistTemplate;
  checklist: ClientChecklist;
  clientName: string;
  onBack: () => void;
}

export const ChecklistForm: React.FC<ChecklistFormProps> = ({
  template,
  checklist,
  clientName,
  onBack
}) => {
  const { updateChecklist } = useChecklists();
  const [completedItems, setCompletedItems] = useState<string[]>(checklist.completed_items);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const hasChanges = JSON.stringify(completedItems.sort()) !== JSON.stringify(checklist.completed_items.sort());
    setHasChanges(hasChanges);
  }, [completedItems, checklist.completed_items]);

  const handleItemToggle = (itemId: string) => {
    setCompletedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSave = () => {
    updateChecklist({
      id: checklist.id,
      completedItems,
      status: completedItems.length === template.items.length ? 'completed' : 'in_progress'
    });
    setHasChanges(false);
  };

  const handleComplete = () => {
    const allCompleted = template.items.map(item => item.id);
    setCompletedItems(allCompleted);
    updateChecklist({
      id: checklist.id,
      completedItems: allCompleted,
      status: 'completed'
    });
    setHasChanges(false);
  };

  const progress = (completedItems.length / template.items.length) * 100;
  const isCompleted = checklist.status === 'completed';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Checklists
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {template.name} Launch Checklist
                {isCompleted && <CheckCircle className="h-5 w-5 text-green-600" />}
              </CardTitle>
              <CardDescription>
                Client: {clientName}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{completedItems.length}/{template.items.length}</div>
              <div className="text-sm text-muted-foreground">completed</div>
            </div>
          </div>
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
              <div className="flex gap-2">
                {hasChanges && (
                  <Button size="sm" onClick={handleSave}>
                    Save Progress
                  </Button>
                )}
                {!isCompleted && completedItems.length === template.items.length && (
                  <Button size="sm" onClick={handleComplete}>
                    Mark Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {template.items.map((item) => (
              <div key={item.id} className="flex items-start space-x-3 p-4 rounded-lg border">
                <Checkbox
                  id={item.id}
                  checked={completedItems.includes(item.id)}
                  onCheckedChange={() => handleItemToggle(item.id)}
                  disabled={isCompleted}
                />
                <div className="flex-1">
                  <label 
                    htmlFor={item.id}
                    className={`font-medium cursor-pointer ${
                      completedItems.includes(item.id) ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {item.title}
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
