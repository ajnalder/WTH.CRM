// TODO: Migrate to Convex - currently stubbed (complex voice processing logic)
export const useVoiceCommands = () => {
  return {
    isListening: false,
    isProcessing: false,
    transcript: '',
    isSupported: false,
    startListening: () => console.warn('Voice commands not yet migrated to Convex'),
    stopListening: () => {},
  };
};
