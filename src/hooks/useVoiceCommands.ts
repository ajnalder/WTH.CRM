import { useState, useRef, useCallback, useEffect } from 'react';
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
  const finalTranscriptRef = useRef('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
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
    
    // Updated configuration for longer speech recognition
    recognition.continuous = true; // Keep listening continuously
    recognition.interimResults = true; // Show interim results
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('useVoiceCommands - Voice recognition started');
      setIsListening(true);
      setTranscript('');
      finalTranscriptRef.current = '';
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Update the cumulative final transcript
      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript;
        console.log('useVoiceCommands - Final transcript so far:', finalTranscriptRef.current);
      }

      // Show current transcript (final + interim)
      const currentTranscript = finalTranscriptRef.current + interimTranscript;
      setTranscript(currentTranscript);

      // Reset the timeout on each speech detection
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set a new timeout to stop listening after silence
      timeoutRef.current = setTimeout(() => {
        console.log('useVoiceCommands - Speech timeout reached, stopping recognition');
        if (recognition && isListening) {
          recognition.stop();
        }
      }, 2000); // Wait 2 seconds of silence before stopping
    };

    recognition.onerror = (event) => {
      console.error('useVoiceCommands - Speech recognition error:', event.error);
      setIsListening(false);
      
      // Clear timeout on error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Don't show error for 'no-speech' as it's common
      if (event.error !== 'no-speech') {
        toast({
          title: "Voice Error",
          description: `Speech recognition error: ${event.error}. Please try again.`,
          variant: "destructive",
        });
      }
    };

    recognition.onend = () => {
      console.log('useVoiceCommands - Voice recognition ended');
      setIsListening(false);
      
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Process the final transcript if we have one
      const finalText = finalTranscriptRef.current.trim();
      if (finalText) {
        console.log('useVoiceCommands - Processing final transcript:', finalText);
        processVoiceCommand(finalText);
      } else {
        console.log('useVoiceCommands - No final transcript to process');
      }
    };

    return recognition;
  }, [checkSupport, toast, isListening]);

  // Process voice command through AI
  const processVoiceCommand = async (voiceText: string) => {
    console.log('useVoiceCommands - Starting to process voice command:', voiceText);
    setIsProcessing(true);
    
    try {
      console.log('useVoiceCommands - Calling Supabase function');
      
      const { data, error } = await supabase.functions.invoke('parse-voice-command', {
        body: { voiceText }
      });

      if (error) {
        console.error('useVoiceCommands - Supabase function error:', error);
        throw error;
      }

      console.log('useVoiceCommands - Voice command parsed successfully:', data);
      const result: VoiceCommandResult = data;
      await handleVoiceCommandResult(result);
      
    } catch (error) {
      console.error('useVoiceCommands - Error processing voice command:', error);
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
    console.log('useVoiceCommands - Handling voice command result:', result);
    
    switch (result.type) {
      case 'task':
        console.log('useVoiceCommands - Processing task command');
        await handleTaskCommand(result);
        break;
      case 'project':
        console.log('useVoiceCommands - Processing project command');
        await handleProjectCommand(result);
        break;
      case 'client':
        console.log('useVoiceCommands - Processing client command');
        openClientDialog(result.extractedData);
        break;
      case 'navigation':
        console.log('useVoiceCommands - Processing navigation command');
        handleNavigation(result.extractedData.route);
        break;
      default:
        console.log('useVoiceCommands - Unknown command type:', result.type);
        toast({
          title: "Command Not Understood",
          description: "I couldn't understand that command. Please try again.",
          variant: "destructive",
        });
    }
  };

  const handleTaskCommand = async (result: VoiceCommandResult) => {
    try {
      console.log('useVoiceCommands - Handling task command with data:', result.extractedData);
      
      // Enhanced data preparation - if no project context, create temporary state
      let enhancedData = { ...result.extractedData };
      
      // If a client is mentioned, look up their projects
      if (result.extractedData.client) {
        console.log('useVoiceCommands - Looking up projects for client:', result.extractedData.client);
        
        const { data: clients, error: clientError } = await supabase
          .from('clients')
          .select('id, company')
          .ilike('company', `%${result.extractedData.client}%`);

        if (clientError) {
          console.error('useVoiceCommands - Error fetching clients:', clientError);
          throw clientError;
        }

        if (clients && clients.length > 0) {
          const client = clients[0];
          console.log('useVoiceCommands - Found client:', client);
          
          // Get projects for this client
          const { data: projects, error: projectError } = await supabase
            .from('projects')
            .select('id, name')
            .eq('client_id', client.id);

          if (projectError) {
            console.error('useVoiceCommands - Error fetching projects:', projectError);
            throw projectError;
          }

          console.log('useVoiceCommands - Found projects for client:', projects);

          // Prepare enhanced data for the dialog
          enhancedData = {
            ...result.extractedData,
            clientId: client.id,
            clientName: client.company,
            availableProjects: projects || [],
            // If only one project, auto-select it
            project: projects && projects.length === 1 ? projects[0].name : enhancedData.project
          };
        } else {
          console.log('useVoiceCommands - No client found matching:', result.extractedData.client);
          toast({
            title: "Client Not Found",
            description: `Couldn't find a client matching "${result.extractedData.client}". Creating task in temporary mode.`,
          });
        }
      }

      console.log('useVoiceCommands - Opening task dialog with enhanced data:', enhancedData);
      
      // Always open the dialog, even if in temporary mode
      openTaskDialog(enhancedData);
      
      // Show user feedback
      toast({
        title: "Task Dialog Opened",
        description: enhancedData.clientName 
          ? `Creating task for ${enhancedData.clientName}` 
          : "Task dialog opened. Please complete the details.",
      });
      
    } catch (error) {
      console.error('useVoiceCommands - Error handling task command:', error);
      toast({
        title: "Error",
        description: "Failed to process task command. Opening dialog with basic data.",
        variant: "destructive",
      });
      // Still open the dialog with basic data so user can complete manually
      openTaskDialog(result.extractedData);
    }
  };

  const handleProjectCommand = async (result: VoiceCommandResult) => {
    try {
      console.log('useVoiceCommands - Handling project command with data:', result.extractedData);
      
      // If a client is mentioned, look up the client ID
      if (result.extractedData.client) {
        console.log('useVoiceCommands - Looking up client:', result.extractedData.client);
        
        const { data: clients, error: clientError } = await supabase
          .from('clients')
          .select('id, company')
          .ilike('company', `%${result.extractedData.client}%`);

        if (clientError) {
          console.error('useVoiceCommands - Error fetching clients:', clientError);
          throw clientError;
        }

        if (clients && clients.length > 0) {
          const client = clients[0];
          console.log('useVoiceCommands - Found client:', client);
          
          const enhancedData = {
            ...result.extractedData,
            client_id: client.id,
            clientName: client.company
          };

          console.log('useVoiceCommands - Opening project dialog with enhanced data:', enhancedData);
          openProjectDialog(enhancedData);
        } else {
          console.log('useVoiceCommands - No client found matching:', result.extractedData.client);
          toast({
            title: "Client Not Found",
            description: `Couldn't find a client matching "${result.extractedData.client}". Please select manually.`,
            variant: "destructive",
          });
          openProjectDialog(result.extractedData);
        }
      } else {
        console.log('useVoiceCommands - No client mentioned, opening dialog with original data');
        openProjectDialog(result.extractedData);
      }
    } catch (error) {
      console.error('useVoiceCommands - Error handling project command:', error);
      toast({
        title: "Error",
        description: "Failed to process project command. Please try creating the project manually.",
        variant: "destructive",
      });
      openProjectDialog(result.extractedData);
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
      console.log('Starting voice recognition...');
      finalTranscriptRef.current = '';
      
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
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
      console.log('Manually stopping voice recognition...');
      
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Initialize on mount
  useEffect(() => {
    checkSupport();
    
    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
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
