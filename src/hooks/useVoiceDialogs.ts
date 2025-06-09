
import { useState, useCallback } from 'react';

interface VoiceDialogState {
  isOpen: boolean;
  prefilledData: Record<string, any>;
}

// Singleton state to ensure all components share the same dialog state
let globalDialogState = {
  taskDialog: { isOpen: false, prefilledData: {} },
  projectDialog: { isOpen: false, prefilledData: {} },
  clientDialog: { isOpen: false, prefilledData: {} }
};

let listeners: Array<() => void> = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export const useVoiceDialogs = () => {
  const [, forceUpdate] = useState({});

  // Force component to re-render when global state changes
  const triggerRerender = useCallback(() => {
    console.log('useVoiceDialogs - Force update triggered');
    forceUpdate({});
  }, []);

  // Register this hook instance as a listener
  React.useEffect(() => {
    listeners.push(triggerRerender);
    return () => {
      listeners = listeners.filter(listener => listener !== triggerRerender);
    };
  }, [triggerRerender]);

  const openTaskDialog = useCallback((data: Record<string, any>) => {
    console.log('useVoiceDialogs - Opening task dialog with data:', data);
    globalDialogState.taskDialog = {
      isOpen: true,
      prefilledData: data
    };
    notifyListeners();
  }, []);

  const openProjectDialog = useCallback((data: Record<string, any>) => {
    console.log('useVoiceDialogs - Opening project dialog with data:', data);
    globalDialogState.projectDialog = {
      isOpen: true,
      prefilledData: data
    };
    notifyListeners();
  }, []);

  const openClientDialog = useCallback((data: Record<string, any>) => {
    console.log('useVoiceDialogs - Opening client dialog with data:', data);
    globalDialogState.clientDialog = {
      isOpen: true,
      prefilledData: data
    };
    notifyListeners();
  }, []);

  const closeTaskDialog = useCallback(() => {
    console.log('useVoiceDialogs - Closing task dialog');
    globalDialogState.taskDialog = { isOpen: false, prefilledData: {} };
    notifyListeners();
  }, []);

  const closeProjectDialog = useCallback(() => {
    console.log('useVoiceDialogs - Closing project dialog');
    globalDialogState.projectDialog = { isOpen: false, prefilledData: {} };
    notifyListeners();
  }, []);

  const closeClientDialog = useCallback(() => {
    console.log('useVoiceDialogs - Closing client dialog');
    globalDialogState.clientDialog = { isOpen: false, prefilledData: {} };
    notifyListeners();
  }, []);

  return {
    taskDialog: globalDialogState.taskDialog,
    projectDialog: globalDialogState.projectDialog,
    clientDialog: globalDialogState.clientDialog,
    openTaskDialog,
    openProjectDialog,
    openClientDialog,
    closeTaskDialog,
    closeProjectDialog,
    closeClientDialog
  };
};
