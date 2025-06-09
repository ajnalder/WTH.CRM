
import { useState } from 'react';

interface VoiceDialogState {
  isOpen: boolean;
  prefilledData: Record<string, any>;
}

export const useVoiceDialogs = () => {
  const [taskDialog, setTaskDialog] = useState<VoiceDialogState>({
    isOpen: false,
    prefilledData: {}
  });

  const [projectDialog, setProjectDialog] = useState<VoiceDialogState>({
    isOpen: false,
    prefilledData: {}
  });

  const [clientDialog, setClientDialog] = useState<VoiceDialogState>({
    isOpen: false,
    prefilledData: {}
  });

  const openTaskDialog = (data: Record<string, any>) => {
    setTaskDialog({
      isOpen: true,
      prefilledData: data
    });
  };

  const openProjectDialog = (data: Record<string, any>) => {
    setProjectDialog({
      isOpen: true,
      prefilledData: data
    });
  };

  const openClientDialog = (data: Record<string, any>) => {
    setClientDialog({
      isOpen: true,
      prefilledData: data
    });
  };

  const closeTaskDialog = () => {
    setTaskDialog({ isOpen: false, prefilledData: {} });
  };

  const closeProjectDialog = () => {
    setProjectDialog({ isOpen: false, prefilledData: {} });
  };

  const closeClientDialog = () => {
    setClientDialog({ isOpen: false, prefilledData: {} });
  };

  return {
    taskDialog,
    projectDialog,
    clientDialog,
    openTaskDialog,
    openProjectDialog,
    openClientDialog,
    closeTaskDialog,
    closeProjectDialog,
    closeClientDialog
  };
};
