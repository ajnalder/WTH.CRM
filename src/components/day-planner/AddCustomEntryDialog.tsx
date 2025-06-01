
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface AddCustomEntryDialogProps {
  customTitle: string;
  setCustomTitle: (title: string) => void;
  customDuration: string;
  setCustomDuration: (duration: string) => void;
  customColor: string;
  setCustomColor: (color: string) => void;
  onAddCustomEntry: () => void;
}

export const AddCustomEntryDialog: React.FC<AddCustomEntryDialogProps> = ({
  customTitle,
  setCustomTitle,
  customDuration,
  setCustomDuration,
  customColor,
  setCustomColor,
  onAddCustomEntry
}) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Custom Time Block</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="e.g., Lunch, Coffee Break, Meeting"
          />
        </div>
        <div>
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Select value={customDuration} onValueChange={setCustomDuration}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="90">1.5 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="color">Color</Label>
          <Select value={customColor} onValueChange={setCustomColor}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blue">Blue</SelectItem>
              <SelectItem value="green">Green</SelectItem>
              <SelectItem value="yellow">Yellow</SelectItem>
              <SelectItem value="red">Red</SelectItem>
              <SelectItem value="purple">Purple</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onAddCustomEntry} className="w-full">
          Add Time Block
        </Button>
      </div>
    </DialogContent>
  );
};
