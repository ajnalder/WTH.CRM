
import React from 'react';
import { FileText, Send, AlertTriangle } from 'lucide-react';

interface Invoice {
  id: string;
  status: string;
  total_amount: number;
}

interface PipelineOverviewProps {
  invoices: Invoice[];
}

export const PipelineOverview: React.FC<PipelineOverviewProps> = ({ invoices }) => {
  const draftInvoices = invoices.filter(i => i.status === 'draft');
  const sentInvoices = invoices.filter(i => i.status === 'sent');
  const overdueInvoices = invoices.filter(i => i.status === 'overdue');

  const draftTotal = draftInvoices.reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0);
  const sentTotal = sentInvoices.reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0);
  const overdueTotal = overdueInvoices.reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stages = [
    {
      label: 'Draft',
      count: draftInvoices.length,
      total: draftTotal,
      icon: FileText,
      color: 'bg-gray-100 text-gray-600',
      barColor: 'bg-gray-400',
    },
    {
      label: 'Sent',
      count: sentInvoices.length,
      total: sentTotal,
      icon: Send,
      color: 'bg-blue-100 text-blue-600',
      barColor: 'bg-blue-500',
    },
    {
      label: 'Overdue',
      count: overdueInvoices.length,
      total: overdueTotal,
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-600',
      barColor: 'bg-red-500',
    },
  ];

  const maxTotal = Math.max(draftTotal, sentTotal, overdueTotal, 1);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Pipeline</h3>
      <div className="space-y-3">
        {stages.map((stage) => (
          <div key={stage.label} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-md flex items-center justify-center ${stage.color}`}>
                  <stage.icon size={14} />
                </div>
                <span className="text-sm font-medium text-gray-700">{stage.label}</span>
                <span className="text-xs text-gray-500">({stage.count})</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{formatCurrency(stage.total)}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${stage.barColor} rounded-full transition-all duration-500`}
                style={{ width: `${(stage.total / maxTotal) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Pipeline</span>
          <span className="text-base font-bold text-gray-900">
            {formatCurrency(draftTotal + sentTotal + overdueTotal)}
          </span>
        </div>
      </div>
    </div>
  );
};
