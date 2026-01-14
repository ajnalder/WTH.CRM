import React from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Link } from 'react-router-dom';
import { api } from '@/integrations/convex/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/hooks/useProjects';

interface DashboardRemindersPanelProps {
  projects: Project[];
}

export const DashboardRemindersPanel: React.FC<DashboardRemindersPanelProps> = ({ projects }) => {
  const { user } = useAuth();
  const [nowIso, setNowIso] = React.useState(new Date().toISOString());

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

  const getNextReminderAt = (note: any) => {
    if (note.reminder_status === 'snoozed' && note.reminder_snoozed_until) {
      return note.reminder_snoozed_until;
    }
    return note.remind_at;
  };

  const sortedReminders = React.useMemo(() => {
    const list = reminders ?? [];
    return list
      .map((note) => {
        const project = projects.find((item) => item.id === note.project_id);
        return {
          ...note,
          projectName: project?.name ?? 'Project',
        };
      })
      .sort((a, b) => (getNextReminderAt(a) || '').localeCompare(getNextReminderAt(b) || ''));
  }, [reminders, projects]);

  const handleSnooze = async (id: string, minutes: number) => {
    if (!user) return;
    await snoozeReminder({ id, userId: user.id, minutes });
  };

  const handleComplete = async (id: string) => {
    if (!user) return;
    await completeReminder({ id, userId: user.id });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Reminders</h3>
          <p className="text-xs text-muted-foreground">Due now across all projects</p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {sortedReminders.length} due
        </Badge>
      </div>

      {sortedReminders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reminders due right now.</p>
      ) : (
        <div className="space-y-3">
          {sortedReminders.map((note) => (
            <div key={note.id} className="rounded-md border bg-white p-3 text-sm space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Link
                  to={`/projects/${note.project_id}`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  {note.projectName}
                </Link>
                <Badge variant="outline" className="text-[10px] uppercase">
                  {note.reminder_status === 'snoozed' ? 'Snoozed' : 'Open'}
                </Badge>
              </div>
              <div className="text-gray-700">{note.content}</div>
              <div className="text-xs text-muted-foreground">
                Due{' '}
                {new Date(getNextReminderAt(note)).toLocaleString('en-NZ', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => handleSnooze(note.id, 60)}>
                  Snooze 1h
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleSnooze(note.id, 24 * 60)}>
                  Snooze 1d
                </Button>
                <Button size="sm" onClick={() => handleComplete(note.id)}>
                  Done
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
