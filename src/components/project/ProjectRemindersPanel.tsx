import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProjectNotes } from '@/hooks/useProjectNotes';

export const ProjectRemindersPanel: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { notes, completeReminder, snoozeReminder, isLoading } = useProjectNotes(projectId);

  const reminders = useMemo(() => {
    return notes
      .filter((note) => note.remind_at && note.reminder_status !== 'done')
      .sort((a, b) => (a.remind_at || '').localeCompare(b.remind_at || ''));
  }, [notes]);

  const getNextReminderAt = (note: any) => {
    if (note.reminder_status === 'snoozed' && note.reminder_snoozed_until) {
      return note.reminder_snoozed_until;
    }
    return note.remind_at;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Reminders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading reminders…</p>
        ) : reminders.length > 0 ? (
          reminders.map((note) => (
            <div key={note.id} className="rounded-md border bg-white p-3 text-sm space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-gray-900">Don’t forget</div>
                <Badge variant="outline" className="text-xs">
                  {note.reminder_status === 'snoozed' ? 'Snoozed' : 'Open'}
                </Badge>
              </div>
              <div className="text-gray-700">{note.content}</div>
              <div className="text-xs text-muted-foreground">
                Remind at{' '}
                {new Date(getNextReminderAt(note)!).toLocaleString('en-NZ', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => snoozeReminder(note.id, 60)}>
                  Snooze 1h
                </Button>
                <Button size="sm" variant="outline" onClick={() => snoozeReminder(note.id, 24 * 60)}>
                  Snooze 1d
                </Button>
                <Button size="sm" onClick={() => completeReminder(note.id)}>
                  Mark done
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No reminders yet.</p>
        )}
      </CardContent>
    </Card>
  );
};
