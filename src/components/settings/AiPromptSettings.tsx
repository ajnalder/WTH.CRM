import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAiPromptSettings } from '@/hooks/useAiPromptSettings';

export const AiPromptSettings = () => {
  const { settings, isLoading, isUpdating, updatePrompt, resetToDefault } = useAiPromptSettings();
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (settings?.base_prompt) {
      setDraft(settings.base_prompt);
    }
  }, [settings]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Quote Base Prompt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Base prompt for AI quote generation"
          className="min-h-[220px]"
          disabled={isLoading}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => updatePrompt(draft)}
            disabled={isLoading || isUpdating || draft.trim().length === 0}
          >
            {isUpdating ? 'Saving...' : 'Save Prompt'}
          </Button>
          <Button
            variant="outline"
            onClick={resetToDefault}
            disabled={isLoading || isUpdating}
          >
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
