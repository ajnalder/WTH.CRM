import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useQuoteEvents = () => {
  const logEvent = useMutation({
    mutationFn: async ({
      quote_id,
      event_type,
    }: {
      quote_id: string;
      event_type: 'sent' | 'opened' | 'accepted' | 'declined';
    }) => {
      const { data, error } = await supabase
        .from('quote_events')
        .insert({
          quote_id,
          event_type,
          user_agent: navigator.userAgent,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  });

  return {
    logEvent: logEvent.mutateAsync,
  };
};
