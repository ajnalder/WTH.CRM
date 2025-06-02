
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, CheckCircle, Save, Award } from 'lucide-react';
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

  // Define section titles with colors
  const sectionTitles: Record<string, { title: string; color: string }> = {
    '1': { title: '1. General Settings', color: 'text-blue-600' },
    '2': { title: '2. Domains', color: 'text-green-600' },
    '3': { title: '3. Theme & Branding', color: 'text-purple-600' },
    '4': { title: '4. Pages & Content', color: 'text-orange-600' },
    '5': { title: '5. Products', color: 'text-red-600' },
    '6': { title: '6. Collections & Navigation', color: 'text-indigo-600' },
    '7': { title: '7. Payments', color: 'text-emerald-600' },
    '8': { title: '8. Shipping & Taxes', color: 'text-yellow-600' },
    '9': { title: '9. Legal & Compliance', color: 'text-gray-600' },
    '10': { title: '10. SEO & Analytics', color: 'text-pink-600' },
    '11': { title: '11. Email & Notifications', color: 'text-cyan-600' },
    '12': { title: '12. Apps & Integrations', color: 'text-teal-600' },
    '13': { title: '13. Checkout', color: 'text-violet-600' },
    '14': { title: '14. Operational', color: 'text-amber-600' },
    '15': { title: '15. Launch & Post-launch', color: 'text-rose-600' },
    '16': { title: '16. Optional (Advanced)', color: 'text-slate-600' }
  };

  const progress = (completedItems.length / template.items.length) * 100;
  const isCompleted = checklist.status === 'completed';

  // Calculate progress for each section
  const getSectionProgress = (sectionItems: typeof template.items) => {
    const completedInSection = sectionItems.filter(item => completedItems.includes(item.id)).length;
    return (completedInSection / sectionItems.length) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="hover:bg-white/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2 text-blue-600" />
            Back to Checklists
          </Button>
        </div>

        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-white">
                  {template.name} Launch Checklist
                  {isCompleted && <CheckCircle className="h-6 w-6 text-green-300" />}
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Client: {clientName}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{completedItems.length}/{template.items.length}</div>
                <div className="text-sm text-blue-100">completed</div>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              <Progress value={progress} className="w-full h-3 bg-blue-200" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-100">{Math.round(progress)}% complete</span>
                <div className="flex gap-2">
                  {hasChanges && (
                    <Button 
                      size="sm" 
                      onClick={handleSave}
                      className="bg-white text-blue-600 hover:bg-blue-50 shadow-md"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Progress
                    </Button>
                  )}
                  {!isCompleted && completedItems.length === template.items.length && (
                    <Button 
                      size="sm" 
                      onClick={handleComplete}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md"
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Accordion type="multiple" className="w-full space-y-4">
              {Object.entries(groupedItems)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([sectionNumber, sectionItems]) => {
                  const sectionProgress = getSectionProgress(sectionItems);
                  const completedInSection = sectionItems.filter(item => completedItems.includes(item.id)).length;
                  const sectionInfo = sectionTitles[sectionNumber] || { title: `Section ${sectionNumber}`, color: 'text-gray-600' };
                  
                  return (
                    <AccordionItem key={sectionNumber} value={sectionNumber} className="border border-gray-200 rounded-lg shadow-sm bg-white">
                      <AccordionTrigger className="hover:no-underline px-6 py-4 hover:bg-gray-50 rounded-t-lg">
                        <div className="flex items-center justify-between w-full mr-4">
                          <span className={`font-semibold text-left ${sectionInfo.color}`}>
                            {sectionInfo.title}
                          </span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600 font-medium">
                              {completedInSection}/{sectionItems.length}
                            </span>
                            <Progress 
                              value={sectionProgress} 
                              className="w-24 h-2" 
                            />
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <div className="space-y-3 pt-2">
                          {sectionItems.map((item) => (
                            <div key={item.id} className="flex items-start space-x-3 p-4 rounded-lg border border-gray-100 bg-gradient-to-r from-gray-50 to-white hover:shadow-md transition-all duration-200">
                              <Checkbox
                                id={item.id}
                                checked={completedItems.includes(item.id)}
                                onCheckedChange={() => handleItemToggle(item.id)}
                                disabled={isCompleted}
                                className="mt-0.5 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                              />
                              <div className="flex-1">
                                <label 
                                  htmlFor={item.id}
                                  className={`font-medium cursor-pointer transition-all duration-200 ${
                                    completedItems.includes(item.id) 
                                      ? 'line-through text-green-600' 
                                      : 'text-gray-800 hover:text-blue-600'
                                  }`}
                                >
                                  {item.title}
                                </label>
                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
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
    </div>
  );
};
