
import React, { useEffect } from 'react';
import { useVoiceDialogs } from '@/hooks/useVoiceDialogs';
import { VoiceTaskDialog } from './VoiceTaskDialog';
import { VoiceProjectDialog } from './VoiceProjectDialog';
import { VoiceClientDialog } from './VoiceClientDialog';

export const VoiceDialogManager: React.FC = () => {
  const {
    taskDialog,
    projectDialog,
    clientDialog,
    closeTaskDialog,
    closeProjectDialog,
    closeClientDialog
  } = useVoiceDialogs();

  // Add debugging logs to track dialog state changes
  useEffect(() => {
    console.log('VoiceDialogManager - Dialog states:', {
      taskDialog: { isOpen: taskDialog.isOpen, hasData: Object.keys(taskDialog.prefilledData).length > 0 },
      projectDialog: { isOpen: projectDialog.isOpen, hasData: Object.keys(projectDialog.prefilledData).length > 0 },
      clientDialog: { isOpen: clientDialog.isOpen, hasData: Object.keys(clientDialog.prefilledData).length > 0 }
    });
  }, [taskDialog, projectDialog, clientDialog]);

  console.log('VoiceDialogManager - Rendering with states:', {
    taskOpen: taskDialog.isOpen,
    projectOpen: projectDialog.isOpen,
    clientOpen: clientDialog.isOpen
  });

  return (
    <div className="voice-dialog-manager">
      {taskDialog.isOpen && (
        <VoiceTaskDialog
          open={taskDialog.isOpen}
          onOpenChange={(open) => {
            console.log('VoiceTaskDialog - onOpenChange called with:', open);
            if (!open) closeTaskDialog();
          }}
          prefilledData={taskDialog.prefilledData}
        />
      )}

      {projectDialog.isOpen && (
        <VoiceProjectDialog
          open={projectDialog.isOpen}
          onOpenChange={(open) => {
            console.log('VoiceProjectDialog - onOpenChange called with:', open);
            if (!open) closeProjectDialog();
          }}
          prefilledData={projectDialog.prefilledData}
        />
      )}

      {clientDialog.isOpen && (
        <VoiceClientDialog
          open={clientDialog.isOpen}
          onOpenChange={(open) => {
            console.log('VoiceClientDialog - onOpenChange called with:', open);
            if (!open) closeClientDialog();
          }}
          prefilledData={clientDialog.prefilledData}
        />
      )}
    </div>
  );
};
