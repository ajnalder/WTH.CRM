
import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useVoiceDialogs } from './useVoiceDialogs';

interface VoiceCommandResult {
  type: 'task' | 'project' | 'client' | 'navigation' | 'unknown';
  action: string;
  extractedData: Record<string, any>;
  missingRequiredFields: string[];
  confidence: number;
}

export const useVoiceCommands = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { openTaskDialog, openProjectDialog, openClientDialog } = useVoiceDialogs();

  // Check if speech recognition is supported
  const checkSupport = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    return !!SpeechRecognition;
  }, []);

  // Initialize speech recognition
  const initializeRecognition = useCallback(() => {
    if (!checkSupport()) return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        processVoiceCommand(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast({
        title: "Voice Error",
        description: "There was an error with voice recognition. Please try again.",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  }, [checkSupport, toast]);

  // Process voice command through AI
  const processVoiceCommand = async (voiceText: string) => {
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('parse-voice-command', {
        body: { voiceText }
      });

      if (error) throw error;

      const result: VoiceCommandResult = data;
      await handleVoiceCommandResult(result);
      
    } catch (error) {
      console.error('Error processing voice command:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process voice command. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setTranscript('');
    }
  };

  // Handle the parsed voice command result
  const handleVoiceCommandResult = async (result: VoiceCommandResult) => {
    switch (result.type) {
      case 'task':
        openTaskDialog(result.extractedData);
        break;
      case 'project':
        openProjectDialog(result.extractedData);
        break;
      case 'client':
        openClientDialog(result.extractedData);
        break;
      case 'navigation':
        handleNavigation(result.extractedData.route);
        break;
      default:
        toast({
          title: "Command Not Understood",
          description: "I couldn't understand that command. Please try again.",
          variant: "destructive",
        });
    }
  };

  const handleNavigation = (route: string) => {
    if (route) {
      navigate(route);
      toast({
        title: "Navigation",
        description: `Navigating to ${route}`,
      });
    }
  };

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      recognitionRef.current = initializeRecognition();
    }
    
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  }, [initializeRecognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Initialize on mount
  React.useEffect(() => {
    checkSupport();
  }, [checkSupport]);

  return {
    isListening,
    isProcessing,
    transcript,
    isSupported,
    startListening,
    stopListening
  };
};
