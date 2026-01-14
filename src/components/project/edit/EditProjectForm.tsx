
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProjectBasicFields } from './ProjectBasicFields';
import { ProjectDateFields } from './ProjectDateFields';
import { ProjectSettingsFields } from './ProjectSettingsFields';
import { ProjectTeamSection } from './ProjectTeamSection';
import { useProjects } from '@/hooks/useProjects';
import { useProjectTeamMembers } from '@/hooks/useProjectTeamMembers';
import { useInvoices } from '@/hooks/useInvoices';
import { useMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const editProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  status: z.enum(['Planning', 'In Progress', 'Review', 'Completed']),
  priority: z.enum(['Low', 'Medium', 'High']),
  start_date: z.date().optional(),
  due_date: z.date().optional(),
  budget: z.string().optional(),
  is_retainer: z.boolean(),
  is_billable: z.boolean(),
});

type EditProjectFormData = z.infer<typeof editProjectSchema>;

interface Project {
  id: string;
  name: string;
  description: string;
  client: string;
  status: string;
  priority: string;
  startDate: string;
  dueDate: string;
  budget: number;
  isRetainer: boolean;
  client_id?: string;
  is_billable?: boolean;
}

interface EditProjectFormProps {
  project: Project;
  onSuccess: () => void;
}

export const EditProjectForm: React.FC<EditProjectFormProps> = ({ 
  project, 
  onSuccess 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { updateProject, isUpdating } = useProjects();
  const { invoices, createInvoice } = useInvoices();
  const createInvoiceItem = useMutation(api.invoiceItems.create);
  const recalculateTotals = useMutation(api.invoices.recalculateTotals);
  const { 
    projectTeamMembers, 
    assignTeamMember, 
    removeTeamMember 
  } = useProjectTeamMembers(project.id);
  const [depositPercentage, setDepositPercentage] = useState(50);
  const [isCreatingDeposit, setIsCreatingDeposit] = useState(false);

  const form = useForm<EditProjectFormData>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      name: project.name,
      description: project.description || '',
      status: (project.status as EditProjectFormData['status']) || 'Planning',
      priority: (project.priority as EditProjectFormData['priority']) || 'Medium',
      start_date: project.startDate ? new Date(project.startDate) : undefined,
      due_date: project.dueDate ? new Date(project.dueDate) : undefined,
      budget: project.budget ? project.budget.toString() : '',
      is_retainer: project.isRetainer || false,
      is_billable: project.is_billable ?? true,
    },
  });

  const formatDate = (date?: Date) => {
    if (!date) return undefined;
    return date.toISOString().split('T')[0];
  };

  const roundCurrency = (value: number) => Math.round(value * 100) / 100;

  const getNextInvoiceNumber = () => {
    let nextNumber = 5057;
    invoices
      .filter((inv) => inv.invoice_number?.startsWith('INV-'))
      .forEach((inv) => {
        const current = parseInt(inv.invoice_number.replace('INV-', ''));
        if (!isNaN(current) && current >= nextNumber) {
          nextNumber = current + 1;
        }
      });
    return `INV-${nextNumber}`;
  };

  const budgetValue = form.watch('budget');
  const isRetainer = form.watch('is_retainer');
  const nameValue = form.watch('name');
  const descriptionValue = form.watch('description');
  const dueDateValue = form.watch('due_date');

  const parsedBudget = useMemo(() => {
    if (!budgetValue) return NaN;
    return parseFloat(budgetValue);
  }, [budgetValue]);

  const safeDepositPercentage = useMemo(() => {
    return Math.min(100, Math.max(0, depositPercentage || 0));
  }, [depositPercentage]);

  const depositAmount = useMemo(() => {
    if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) return 0;
    return roundCurrency((parsedBudget * safeDepositPercentage) / 100);
  }, [parsedBudget, safeDepositPercentage]);

  const hasDepositInvoice = invoices.some((invoice) => {
    if (invoice.project_id !== project.id) return false;
    const title = invoice.title?.toLowerCase() || '';
    return invoice.deposit_amount > 0 || invoice.deposit_percentage > 0 || title.includes('deposit');
  });

  const canCreateDeposit =
    Boolean(project.client_id) &&
    Number.isFinite(parsedBudget) &&
    parsedBudget > 0 &&
    safeDepositPercentage > 0 &&
    !isRetainer &&
    !hasDepositInvoice;

  const handleCreateDepositInvoice = async () => {
    if (!user) {
      toast({ title: 'Error', description: 'You need to be signed in.', variant: 'destructive' });
      return;
    }
    if (!project.client_id) {
      toast({ title: 'Error', description: 'Project client is missing.', variant: 'destructive' });
      return;
    }
    if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) {
      toast({ title: 'Error', description: 'Set a project value first.', variant: 'destructive' });
      return;
    }
    if (!safeDepositPercentage || safeDepositPercentage <= 0) {
      toast({ title: 'Error', description: 'Enter a deposit percentage greater than 0.', variant: 'destructive' });
      return;
    }

    setIsCreatingDeposit(true);
    try {
      const subtotal = depositAmount;
      const gstRate = 15;
      const gstAmount = roundCurrency(subtotal * (gstRate / 100));
      const totalAmount = roundCurrency(subtotal + gstAmount);
      const invoiceTitle = `Deposit for ${nameValue || project.name}`;
      const lineItemDescription = `Deposit (${safeDepositPercentage}%) - ${nameValue || project.name}`;

      const createdInvoice = await createInvoice({
        client_id: project.client_id,
        project_id: project.id,
        invoice_number: getNextInvoiceNumber(),
        title: invoiceTitle,
        description: descriptionValue || project.description || undefined,
        subtotal,
        gst_rate: gstRate,
        gst_amount: gstAmount,
        subtotal_incl_gst: totalAmount,
        total_amount: totalAmount,
        deposit_percentage: safeDepositPercentage,
        deposit_amount: subtotal,
        balance_due: totalAmount,
        status: 'draft',
        issued_date: formatDate(new Date()),
        due_date: formatDate(dueDateValue),
      });

      if (!createdInvoice || typeof createdInvoice !== 'object' || !('id' in createdInvoice)) {
        throw new Error('Invoice creation failed.');
      }

      await createInvoiceItem({
        invoiceId: createdInvoice.id,
        userId: user.id,
        description: lineItemDescription,
        quantity: 1,
        rate: subtotal,
        amount: subtotal,
      });

      await recalculateTotals({ invoiceId: createdInvoice.id, userId: user.id });
    } catch (error) {
      console.error('Error creating deposit invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to create deposit invoice.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingDeposit(false);
    }
  };

  const onSubmit = (data: EditProjectFormData) => {
    updateProject({
      projectId: project.id,
      projectData: {
        name: data.name,
        description: data.description,
        status: data.status,
        priority: data.priority,
        start_date: data.start_date?.toISOString().split('T')[0] || null,
        due_date: data.due_date?.toISOString().split('T')[0] || null,
        budget: data.budget ? parseFloat(data.budget) : null,
        is_retainer: data.is_retainer,
        is_billable: data.is_billable,
      }
    });
    onSuccess();
  };

  const selectedMembers = projectTeamMembers.map(ptm => ptm.user_id);

  const handleMemberToggle = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      const projectTeamMember = projectTeamMembers.find(
        ptm => ptm.user_id === memberId
      );
      if (projectTeamMember) {
        removeTeamMember({ 
          projectId: project.id, 
          teamMemberId: projectTeamMember.id 
        });
      }
    } else {
      assignTeamMember({ 
        projectId: project.id, 
        teamMemberId: memberId 
      });
    }
  };

  const handleRemoveMember = (memberId: string) => {
    const projectTeamMember = projectTeamMembers.find(
      ptm => ptm.user_id === memberId
    );
    if (projectTeamMember) {
      removeTeamMember({ 
        projectId: project.id, 
        teamMemberId: projectTeamMember.id 
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ProjectBasicFields 
          control={form.control as any} 
          clientName={project.client}
        />
        <ProjectDateFields control={form.control as any} />
        <ProjectSettingsFields control={form.control as any} />
        <div className="rounded-lg border p-4 space-y-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-900">Initial Deposit Invoice</h3>
            <p className="text-xs text-muted-foreground">
              Create a draft invoice from the project value with a single deposit line item.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="md:col-span-2 space-y-1">
              <Label htmlFor="deposit-percentage">Deposit percentage</Label>
              <Input
                id="deposit-percentage"
                type="number"
                min={0}
                max={100}
                value={depositPercentage}
                onChange={(e) => setDepositPercentage(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <Label>Deposit amount</Label>
              <div className="h-10 flex items-center rounded-md border bg-muted/30 px-3 text-sm text-muted-foreground">
                {Number.isFinite(parsedBudget) && parsedBudget > 0
                  ? `$${depositAmount.toFixed(2)}`
                  : 'Set project value'}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Uses the project client, description, and dates.
            </p>
            <Button
              type="button"
              onClick={handleCreateDepositInvoice}
              disabled={!canCreateDeposit || isCreatingDeposit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCreatingDeposit ? 'Creating...' : 'Create Deposit Invoice'}
            </Button>
          </div>
          {!project.client_id && (
            <p className="text-xs text-muted-foreground">
              Add a client to this project to enable deposit invoices.
            </p>
          )}
          {isRetainer && (
            <p className="text-xs text-muted-foreground">
              Retainer projects usually don't use deposit invoices.
            </p>
          )}
          {hasDepositInvoice && (
            <p className="text-xs text-muted-foreground">
              A deposit invoice already exists for this project.
            </p>
          )}
        </div>
        <ProjectTeamSection
          selectedMembers={selectedMembers}
          onMemberToggle={handleMemberToggle}
          onRemoveMember={handleRemoveMember}
        />
        
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button 
            type="submit" 
            disabled={isUpdating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUpdating ? 'Updating...' : 'Update Project'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
