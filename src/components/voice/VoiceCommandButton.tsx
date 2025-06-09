
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { cn } from '@/lib/utils';

export const VoiceCommandButton: React.FC = () => {
  const {
    isListening,
    isProcessing,
    transcript,
    startListening,
    stopListening,
    isSupported
  } = useVoiceCommands();

  if (!isSupported) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-end gap-2">
        {transcript && (
          <div className="bg-white border rounded-lg shadow-lg p-3 max-w-xs">
            <p className="text-sm text-gray-600">Voice input:</p>
            <p className="text-sm font-medium">{transcript}</p>
          </div>
        )}
        
        <Button
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all duration-200",
            isListening 
              ? "bg-red-500 hover:bg-red-600 animate-pulse" 
              : "bg-blue-500 hover:bg-blue-600",
            isProcessing && "cursor-not-allowed opacity-75"
          )}
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          ) : isListening ? (
            <MicOff className="h-6 w-6 text-white" />
          ) : (
            <Mic className="h-6 w-6 text-white" />
          )}
        </Button>
      </div>
    </div>
  );
};
