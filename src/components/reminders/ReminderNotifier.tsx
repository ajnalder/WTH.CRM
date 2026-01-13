import React from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export const ReminderNotifier: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [nowIso, setNowIso] = React.useState(new Date().toISOString());
  const notifiedRef = React.useRef(new Set<string>());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNowIso(new Date().toISOString());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const reminders = useQuery(
    api.projectNotes.listDueReminders,
    user ? { userId: user.id, nowIso } : undefined
  ) as any[] | undefined;

  const completeReminder = useMutation(api.projectNotes.completeReminder);
  const snoozeReminder = useMutation(api.projectNotes.snoozeReminder);

  React.useEffect(() => {
    if (!reminders || reminders.length === 0) return;

    reminders.forEach((reminder) => {
      if (notifiedRef.current.has(reminder.id)) return;
      notifiedRef.current.add(reminder.id);

      toast({
        title: "Don't forget to do this",
        description: (
          <div className="space-y-2">
            <div className="text-sm text-foreground">{reminder.content}</div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  notifiedRef.current.delete(reminder.id);
                  snoozeReminder({ id: reminder.id, userId: user!.id, minutes: 60 });
                }}
              >
                Snooze 1h
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  notifiedRef.current.delete(reminder.id);
                  completeReminder({ id: reminder.id, userId: user!.id });
                }}
              >
                Done
              </Button>
            </div>
          </div>
        ),
      });
    });
  }, [reminders, toast, snoozeReminder, completeReminder, user]);

  return null;
};
