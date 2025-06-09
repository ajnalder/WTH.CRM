
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Smartphone, Mic } from 'lucide-react';
import { isMobile } from '@/utils/mobileDetection';

interface MobileVoiceInstructionsProps {
  isVisible: boolean;
}

export const MobileVoiceInstructions: React.FC<MobileVoiceInstructionsProps> = ({ isVisible }) => {
  if (!isMobile() || !isVisible) return null;

  return (
    <Card className="mb-4 bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">Mobile Voice Tips:</p>
            <ul className="space-y-1 text-xs">
              <li>• Tap and hold the microphone button</li>
              <li>• Speak clearly and at normal pace</li>
              <li>• Try to minimize background noise</li>
              <li>• Release when finished speaking</li>
              <li>• Wait for processing to complete</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
