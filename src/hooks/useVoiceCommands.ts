
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
      console.log('Processing voice command:', voiceText);
      
      const { data, error } = await supabase.functions.invoke('parse-voice-command', {
        body: { voiceText }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Voice command parsed:', data);
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
    console.log('Handling voice command result:', result);
    
    switch (result.type) {
      case 'task':
        await handleTaskCommand(result);
        break;
      case 'project':
        await handleProjectCommand(result);
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

  const handleTaskCommand = async (result: VoiceCommandResult) => {
    try {
      console.log('Handling task command with data:', result.extractedData);
      
      // If a client is mentioned, look up their projects
      if (result.extractedData.client) {
        console.log('Looking up projects for client:', result.extractedData.client);
        
        const { data: clients, error: clientError } = await supabase
          .from('clients')
          .select('id, company')
          .ilike('company', `%${result.extractedData.client}%`);

        if (clientError) {
          console.error('Error fetching clients:', clientError);
          throw clientError;
        }

        if (clients && clients.length > 0) {
          const client = clients[0];
          console.log('Found client:', client);
          
          // Get projects for this client
          const { data: projects, error: projectError } = await supabase
            .from('projects')
            .select('id, name')
            .eq('client_id', client.id);

          if (projectError) {
            console.error('Error fetching projects:', projectError);
            throw projectError;
          }

          console.log('Found projects for client:', projects);

          // Prepare enhanced data for the dialog
          const enhancedData = {
            ...result.extractedData,
            clientId: client.id,
            clientName: client.company,
            availableProjects: projects || [],
            // If only one project, auto-select it
            project: projects && projects.length === 1 ? projects[0].name : undefined
          };

          console.log('Opening task dialog with enhanced data:', enhancedData);
          openTaskDialog(enhancedData);
        } else {
          console.log('No client found matching:', result.extractedData.client);
          toast({
            title: "Client Not Found",
            description: `Couldn't find a client matching "${result.extractedData.client}". Please select manually.`,
            variant: "destructive",
          });
          openTaskDialog(result.extractedData);
        }
      } else {
        console.log('No client mentioned, opening dialog with original data');
        openTaskDialog(result.extractedData);
      }
    } catch (error) {
      console.error('Error handling task command:', error);
      toast({
        title: "Error",
        description: "Failed to process task command. Please try creating the task manually.",
        variant: "destructive",
      });
      // Still open the dialog with basic data so user can complete manually
      openTaskDialog(result.extractedData);
    }
  };

  const handleProjectCommand = async (result: VoiceCommandResult) => {
    try {
      console.log('Handling project command with data:', result.extractedData);
      
      // If a client is mentioned, look up the client ID
      if (result.extractedData.client) {
        console.log('Looking up client:', result.extractedData.client);
        
        const { data: clients, error: clientError } = await supabase
          .from('clients')
          .select('id, company')
          .ilike('company', `%${result.extractedData.client}%`);

        if (clientError) {
          console.error('Error fetching clients:', clientError);
          throw clientError;
        }

        if (clients && clients.length > 0) {
          const client = clients[0];
          console.log('Found client:', client);
          
          const enhancedData = {
            ...result.extractedData,
            client_id: client.id,
            clientName: client.company
          };

          console.log('Opening project dialog with enhanced data:', enhancedData);
          openProjectDialog(enhancedData);
        } else {
          console.log('No client found matching:', result.extractedData.client);
          toast({
            title: "Client Not Found",
            description: `Couldn't find a client matching "${result.extractedData.client}". Please select manually.`,
            variant: "destructive",
          });
          openProjectDialog(result.extractedData);
        }
      } else {
        console.log('No client mentioned, opening dialog with original data');
        openProjectDialog(result.extractedData);
      }
    } catch (error) {
      console.error('Error handling project command:', error);
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
      recognitionRef.current.start();
    }
  }, [initializeRecognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Initialize on mount
  useEffect(() => {
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
