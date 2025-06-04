
export interface TaskFormData {
  title: string;
  description: string;
  project: string;
  assignee: string;
  dueDate: string;
  multipleTasks: string;
}

export interface TaskCreateDialogProps {
  triggerText?: string;
  triggerVariant?: 'default' | 'outline';
  prefilledProject?: string;
  multipleMode?: boolean;
  onTaskCreated?: () => void;
}
