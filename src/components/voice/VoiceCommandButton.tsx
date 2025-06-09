
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2, CheckCircle } from 'lucide-react';
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

  const [showSuccess, setShowSuccess] = useState(false);

  // Show success feedback briefly after processing
  useEffect(() => {
    if (!isProcessing && !isListening && transcript === '') {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isProcessing, isListening, transcript]);

  if (!isSupported) {
    return null;
  }

  const getButtonIcon = () => {
    if (showSuccess) return <CheckCircle className="h-6 w-6 text-white" />;
    if (isProcessing) return <Loader2 className="h-6 w-6 animate-spin text-white" />;
    if (isListening) return <MicOff className="h-6 w-6 text-white" />;
    return <Mic className="h-6 w-6 text-white" />;
  };

  const getButtonColor = () => {
    if (showSuccess) return "bg-green-500 hover:bg-green-600";
    if (isListening) return "bg-red-500 hover:bg-red-600 animate-pulse";
    if (isProcessing) return "bg-yellow-500 hover:bg-yellow-600";
    return "bg-blue-500 hover:bg-blue-600";
  };

  const getStatusText = () => {
    if (showSuccess) return "Command processed!";
    if (isProcessing) return "Processing voice command...";
    if (isListening) return "Listening... (speak now)";
    return "Click to start voice command";
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-end gap-2">
        {(transcript || isProcessing || isListening || showSuccess) && (
          <div className="bg-white border rounded-lg shadow-lg p-3 max-w-xs">
            <p className="text-xs text-gray-500 mb-1">{getStatusText()}</p>
            {transcript && (
              <p className="text-sm font-medium text-gray-800">{transcript}</p>
            )}
            {isProcessing && (
              <p className="text-sm text-blue-600">Creating dialog...</p>
            )}
            {showSuccess && (
              <p className="text-sm text-green-600">Check for dialog!</p>
            )}
          </div>
        )}
        
        <Button
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all duration-200",
            getButtonColor(),
            isProcessing && "cursor-not-allowed opacity-75"
          )}
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
        >
          {getButtonIcon()}
        </Button>
      </div>
    </div>
  );
};
