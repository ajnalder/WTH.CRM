
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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

  // Group items by section based on the ID prefix
  const groupedItems = template.items.reduce((groups, item) => {
    const sectionNumber = item.id.split('-')[0];
    if (!groups[sectionNumber]) {
      groups[sectionNumber] = [];
    }
    groups[sectionNumber].push(item);
    return groups;
  }, {} as Record<string, typeof template.items>);

  // Define section titles
  const sectionTitles: Record<string, string> = {
    '1': '1. General Settings',
    '2': '2. Domains',
    '3': '3. Theme & Branding',
    '4': '4. Pages & Content',
    '5': '5. Products',
    '6': '6. Collections & Navigation',
    '7': '7. Payments',
    '8': '8. Shipping & Taxes',
    '9': '9. Legal & Compliance',
    '10': '10. SEO & Analytics',
    '11': '11. Email & Notifications',
    '12': '12. Apps & Integrations',
    '13': '13. Checkout',
    '14': '14. Operational',
    '15': '15. Launch & Post-launch',
    '16': '16. Optional (Advanced)'
  };

  const progress = (completedItems.length / template.items.length) * 100;
  const isCompleted = checklist.status === 'completed';

  // Calculate progress for each section
  const getSectionProgress = (sectionItems: typeof template.items) => {
    const completedInSection = sectionItems.filter(item => completedItems.includes(item.id)).length;
    return (completedInSection / sectionItems.length) * 100;
  };

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
          <Accordion type="multiple" className="w-full">
            {Object.entries(groupedItems)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([sectionNumber, sectionItems]) => {
                const sectionProgress = getSectionProgress(sectionItems);
                const completedInSection = sectionItems.filter(item => completedItems.includes(item.id)).length;
                
                return (
                  <AccordionItem key={sectionNumber} value={sectionNumber}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full mr-4">
                        <span className="font-medium text-left">
                          {sectionTitles[sectionNumber] || `Section ${sectionNumber}`}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            {completedInSection}/{sectionItems.length}
                          </span>
                          <Progress value={sectionProgress} className="w-20" />
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {sectionItems.map((item) => (
                          <div key={item.id} className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
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
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};
