
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Clock, AlertCircle } from 'lucide-react';
import { useEmailLogs } from '@/hooks/useEmailLogs';
import { formatDistanceToNow } from 'date-fns';

interface EmailLogsProps {
  invoiceId: string;
}

export const EmailLogs: React.FC<EmailLogsProps> = ({ invoiceId }) => {
  const { logs, isLoading } = useEmailLogs(invoiceId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail size={18} />
            Email History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail size={18} />
            Email History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">No emails sent for this invoice yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail size={18} />
          Email History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between p-3 border rounded-lg bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{log.recipient_email}</span>
                  <Badge 
                    variant={log.status === 'sent' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {log.status === 'sent' ? (
                      <>
                        <Mail size={12} className="mr-1" />
                        Sent
                      </>
                    ) : (
                      <>
                        <AlertCircle size={12} className="mr-1" />
                        Failed
                      </>
                    )}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-1">{log.subject}</p>
                {log.error_message && (
                  <p className="text-xs text-red-600">{log.error_message}</p>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={12} />
                {formatDistanceToNow(new Date(log.sent_at), { addSuffix: true })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
