
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface EmailFormProps {
  email: string;
  setEmail: (email: string) => void;
  subject: string;
  setSubject: (subject: string) => void;
  message: string;
  setMessage: (message: string) => void;
  sending: boolean;
  onSend: () => void;
  onCancel: () => void;
}

export const EmailForm: React.FC<EmailFormProps> = ({
  email,
  setEmail,
  subject,
  setSubject,
  message,
  setMessage,
  sending,
  onSend,
  onCancel
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="customer@example.com"
        />
      </div>
      
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Invoice subject"
        />
      </div>
      
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add a personal message..."
          rows={6}
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={sending}>
          Cancel
        </Button>
        <Button onClick={onSend} disabled={sending}>
          <Send size={16} className="mr-2" />
          {sending ? 'Sending...' : 'Send Email'}
        </Button>
      </div>
    </div>
  );
};
