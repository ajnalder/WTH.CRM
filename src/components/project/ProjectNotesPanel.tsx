import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useProjectNotes } from '@/hooks/useProjectNotes';

const formatDateHeader = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const dayKey = date.toDateString();
  if (dayKey === today.toDateString()) return 'Today';
  if (dayKey === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short' });
};

export const ProjectNotesPanel: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { notes, createNote, isLoading } = useProjectNotes(projectId);
  const [content, setContent] = useState('');
  const [withReminder, setWithReminder] = useState(false);
  const [remindAt, setRemindAt] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const groupedNotes = useMemo(() => {
    const groups: Record<string, typeof notes> = {};
    notes.forEach((note) => {
      const key = note.created_at.split('T')[0];
      if (!groups[key]) groups[key] = [];
      groups[key].push(note);
    });
    return Object.entries(groups)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, value]) => ({
        key,
        label: formatDateHeader(`${key}T00:00:00.000Z`),
        notes: value,
      }));
  }, [notes]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    try {
      const remindIso = withReminder && remindAt ? new Date(remindAt).toISOString() : undefined;
      await createNote(content.trim(), remindIso);
      setContent('');
      setRemindAt('');
      setWithReminder(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Notes & Reminders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label htmlFor="project_note">Add note</Label>
          <Textarea
            id="project_note"
            value={content}
            placeholder="Add a dated note about what’s happening on this project..."
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={withReminder} onCheckedChange={setWithReminder} />
              <span className="text-xs text-muted-foreground">Set reminder</span>
            </div>
            {withReminder && (
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Remind me at</Label>
                <input
                  type="datetime-local"
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                  value={remindAt}
                  onChange={(e) => setRemindAt(e.target.value)}
                />
              </div>
            )}
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSaving || !content.trim() || (withReminder && !remindAt)}
            >
              {isSaving ? 'Saving...' : 'Add note'}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading notes…</p>
        ) : groupedNotes.length > 0 ? (
          <div className="space-y-4">
            {groupedNotes.map((group) => (
              <div key={group.key} className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase">
                  {group.label}
                </div>
                <div className="space-y-2">
                  {group.notes.map((note) => (
                    <div key={note.id} className="rounded-md border bg-white px-3 py-2 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <p className="text-gray-800">{note.content}</p>
                          <div className="text-xs text-muted-foreground">
                            {new Date(note.created_at).toLocaleTimeString('en-NZ', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                        {note.remind_at && (
                          <Badge variant="secondary" className="text-xs">
                            Reminder set
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        )}
      </CardContent>
    </Card>
  );
};
