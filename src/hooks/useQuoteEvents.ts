import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';

export const useQuoteEvents = () => {
  const logEventMutation = useConvexMutation(api.quoteEvents.create);

  const logEvent = async (eventData: {
    quote_id: string;
    event_type: string;
    ip_address?: string;
    user_agent?: string;
  }) => {
    try {
      await logEventMutation(eventData);
    } catch (error) {
      console.error('Error logging quote event:', error);
    }
  };

  return {
    logEvent,
  };
};

export const useQuoteEventsList = (quoteId: string | undefined) => {
  const eventsData = useConvexQuery(
    api.quoteEvents.listByQuote,
    quoteId ? { quoteId } : undefined
  );

  return {
    events: eventsData ?? [],
    isLoading: eventsData === undefined,
  };
};
