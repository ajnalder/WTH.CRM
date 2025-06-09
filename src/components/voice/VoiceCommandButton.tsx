
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2, CheckCircle, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { MobileVoiceInstructions } from './MobileVoiceInstructions';
import { isMobile } from '@/utils/mobileDetection';
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
  const [showInstructions, setShowInstructions] = useState(false);
  const mobile = isMobile();

  // Show success feedback briefly after processing
  useEffect(() => {
    if (!isProcessing && !isListening && transcript === '') {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isProcessing, isListening, transcript]);

  // Show instructions on first mobile interaction
  useEffect(() => {
    if (mobile && isListening && !showInstructions) {
      setShowInstructions(true);
      const timer = setTimeout(() => setShowInstructions(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [mobile, isListening, showInstructions]);

  if (!isSupported) {
    return null;
  }

  const getButtonIcon = () => {
    if (showSuccess) return <CheckCircle className="h-6 w-6 text-white" />;
    if (isProcessing) return <Loader2 className="h-6 w-6 animate-spin text-white" />;
    if (isListening) return <MicOff className="h-6 w-6 text-white" />;
    if (mobile) return <Smartphone className="h-5 w-5 text-white mr-1" />;
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
    if (isListening) return mobile ? "Listening... (release when done)" : "Listening... (speak now)";
    return mobile ? "Tap & hold to speak" : "Click to start voice command";
  };

  const getButtonText = () => {
    if (mobile && !isListening && !isProcessing && !showSuccess) {
      return "Voice";
    }
    return "";
  };

  const handleMouseDown = () => {
    if (mobile && !isListening && !isProcessing) {
      startListening();
    }
  };

  const handleMouseUp = () => {
    if (mobile && isListening) {
      stopListening();
    }
  };

  const handleClick = () => {
    if (!mobile) {
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-end gap-2">
        <MobileVoiceInstructions isVisible={showInstructions} />
        
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
          size={mobile ? "default" : "lg"}
          className={cn(
            mobile ? "h-12 px-4 rounded-full" : "h-14 w-14 rounded-full",
            "shadow-lg transition-all duration-200",
            getButtonColor(),
            isProcessing && "cursor-not-allowed opacity-75"
          )}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          disabled={isProcessing}
        >
          <div className="flex items-center">
            {getButtonIcon()}
            {getButtonText() && <span className="ml-1 text-sm">{getButtonText()}</span>}
          </div>
        </Button>
      </div>
    </div>
  );
};
