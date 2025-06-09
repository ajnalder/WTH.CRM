
import React from 'react';
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

  return (
    <>
      {taskDialog.isOpen && (
        <VoiceTaskDialog
          open={taskDialog.isOpen}
          onOpenChange={closeTaskDialog}
          prefilledData={taskDialog.prefilledData}
        />
      )}

      {projectDialog.isOpen && (
        <VoiceProjectDialog
          open={projectDialog.isOpen}
          onOpenChange={closeProjectDialog}
          prefilledData={projectDialog.prefilledData}
        />
      )}

      {clientDialog.isOpen && (
        <VoiceClientDialog
          open={clientDialog.isOpen}
          onOpenChange={closeClientDialog}
          prefilledData={clientDialog.prefilledData}
        />
      )}
    </>
  );
};
