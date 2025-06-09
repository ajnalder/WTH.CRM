
import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getMobileVoiceConfig, isMobile } from '@/utils/mobileDetection';

interface UseMobileVoiceRecognitionProps {
  onResult: (transcript: string) => void;
}

export const useMobileVoiceRecognition = ({ onResult }: UseMobileVoiceRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  const config = getMobileVoiceConfig();

  const initializeRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    
    // Mobile-optimized configuration (removed maxAlternatives as it's not supported)
    recognition.continuous = config.continuous;
    recognition.interimResults = config.interimResults;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Mobile voice recognition started');
      setIsListening(true);
      setTranscript('');
      setRetryCount(0);
      
      // Set timeout for mobile
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        if (recognition && isListening) {
          console.log('Mobile voice timeout reached');
          recognition.stop();
        }
      }, config.silenceTimeout);
    };

    recognition.onresult = (event) => {
      console.log('Mobile voice result received:', event.results);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

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

      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);

      if (finalTranscript.trim()) {
        console.log('Mobile final transcript:', finalTranscript);
        setIsProcessing(true);
        onResult(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.error('Mobile voice recognition error:', event.error);
      setIsListening(false);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Mobile-specific error handling with retry logic
      if (event.error === 'no-speech' && retryCount < config.retryAttempts) {
        console.log(`Mobile retry attempt ${retryCount + 1}/${config.retryAttempts}`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          if (recognition) {
            recognition.start();
          }
        }, 1000);
        return;
      }

      if (event.error !== 'no-speech') {
        toast({
          title: "Voice Recognition Error",
          description: isMobile() 
            ? "Voice recognition failed. Try speaking more clearly or check your microphone permissions."
            : `Speech recognition error: ${event.error}`,
          variant: "destructive",
        });
      }
    };

    recognition.onend = () => {
      console.log('Mobile voice recognition ended');
      setIsListening(false);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    return recognition;
  }, [onResult, toast, retryCount, config, isListening]);

  const startListening = useCallback(async () => {
    // Request microphone permissions explicitly on mobile
    if (isMobile()) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (error) {
        console.error('Microphone permission denied:', error);
        toast({
          title: "Microphone Access Required",
          description: "Please allow microphone access to use voice commands.",
          variant: "destructive",
        });
        return;
      }
    }

    if (!recognitionRef.current) {
      recognitionRef.current = initializeRecognition();
    }
    
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting mobile recognition:', error);
        toast({
          title: "Voice Error",
          description: "Failed to start voice recognition. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [initializeRecognition, isListening, toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      console.log('Manually stopping mobile voice recognition');
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setTranscript('');
    setRetryCount(0);
  }, []);

  return {
    isListening,
    isProcessing,
    transcript,
    retryCount,
    startListening,
    stopListening,
    reset
  };
};
