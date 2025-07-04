import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, Download, Calendar, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface ClientTimeReport {
  client_id: string;
  client_name: string;
  total_hours: number;
  total_entries: number;
}

const Reports = () => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), 'yyyy-MM'));

  const { data: hoursReport, isLoading } = useQuery({
    queryKey: ['client-hours-report', selectedMonth, user?.id],
    queryFn: async (): Promise<ClientTimeReport[]> => {
      if (!user) return [];

      const monthDate = new Date(selectedMonth + '-01');
      const startDate = startOfMonth(monthDate);
      const endDate = endOfMonth(monthDate);

      console.log('Fetching hours report for:', {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      });

      // Get time entries for the selected month with task and client information
      const { data: timeEntries, error } = await supabase
        .from('time_entries')
        .select(`
          hours,
          task_id,
          tasks (
            title,
            client_id,
            clients (
              company
            )
          )
        `)
        .eq('user_id', user.id)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'));

      if (error) {
        console.error('Error fetching time entries:', error);
        throw error;
      }

      console.log('Raw time entries:', timeEntries);

      // Group by client and sum hours
      const clientHours = new Map<string, ClientTimeReport>();

      timeEntries?.forEach(entry => {
        const task = entry.tasks;
        if (!task) return;

        let clientId: string;
        let clientName: string;

        if (task.client_id && task.clients) {
          clientId = task.client_id;
          clientName = Array.isArray(task.clients) 
            ? task.clients[0]?.company 
            : task.clients.company;
        } else {
          // Handle unassigned tasks
          clientId = 'unassigned';
          clientName = 'Unassigned Tasks';
        }

        const existing = clientHours.get(clientId) || {
          client_id: clientId,
          client_name: clientName,
          total_hours: 0,
          total_entries: 0
        };

        existing.total_hours += Number(entry.hours);
        existing.total_entries += 1;
        clientHours.set(clientId, existing);
      });

      const result = Array.from(clientHours.values()).sort((a, b) => b.total_hours - a.total_hours);
      console.log('Processed client hours:', result);
      return result;
    },
    enabled: !!user,
  });

  // Generate month options (current month and 11 previous months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy')
    };
  });

  const totalHours = hoursReport?.reduce((sum, client) => sum + client.total_hours, 0) || 0;
  const totalEntries = hoursReport?.reduce((sum, client) => sum + client.total_entries, 0) || 0;

  const handleExport = () => {
    if (!hoursReport) return;

    const csvContent = [
      ['Client', 'Total Hours', 'Time Entries'],
      ...hoursReport.map(client => [
        client.client_name,
        client.total_hours.toFixed(2),
        client.total_entries.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hours-report-${selectedMonth}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Track time spent across clients and projects
          </p>
        </div>
      </div>

      {/* Hours Spent Report */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <CardTitle>Hours Spent Report</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExport}
                disabled={!hoursReport || hoursReport.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                    <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
                    <p className="text-2xl font-bold">{hoursReport?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Time Entries</p>
                    <p className="text-2xl font-bold">{totalEntries}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : hoursReport && hoursReport.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead className="text-right">Time Entries</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hoursReport.map((client) => {
                    const percentage = totalHours > 0 ? (client.total_hours / totalHours) * 100 : 0;
                    return (
                      <TableRow key={client.client_id}>
                        <TableCell className="font-medium">
                          {client.client_name}
                        </TableCell>
                        <TableCell className="text-right">
                          {client.total_hours.toFixed(1)}h
                        </TableCell>
                        <TableCell className="text-right">
                          {client.total_entries}
                        </TableCell>
                        <TableCell className="text-right">
                          {percentage.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No time entries found for {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}</p>
              <p className="text-sm">Start logging time against tasks to see your client hours here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;