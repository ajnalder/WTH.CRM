
import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseFieldVoiceInputProps {
  onResult: (field: string, text: string) => void;
}

export const useFieldVoiceInput = ({ onResult }: UseFieldVoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [currentField, setCurrentField] = useState<string>('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  const initializeRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const result = event.results[0];
      if (result.isFinal) {
        const text = result[0].transcript.trim();
        onResult(currentField, text);
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
      setCurrentField('');
    };

    return recognition;
  }, [currentField, onResult, toast]);

  const startFieldListening = useCallback((fieldName: string) => {
    setCurrentField(fieldName);
    
    if (!recognitionRef.current) {
      recognitionRef.current = initializeRecognition();
    }
    
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  }, [initializeRecognition, isListening]);

  return {
    isListening,
    currentField,
    startFieldListening
  };
};
