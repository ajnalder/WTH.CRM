
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Edit } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ClientDetails } from '@/components/ClientDetails';

interface ClientDetailHeaderProps {
  onBackClick: () => void;
  clientCompany: string;
  clientIndustry?: string;
  clientAvatar?: string;
  clientGradient?: string;
  onDeleteClient?: () => void;
  client?: any;
  onUpdateClient?: (client: any) => void;
}

const ClientDetailHeader = ({
  onBackClick,
  clientCompany,
  clientIndustry,
  clientAvatar,
  clientGradient,
  onDeleteClient,
  client,
  onUpdateClient
}: ClientDetailHeaderProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleDeleteConfirm = () => {
    if (onDeleteClient) {
      onDeleteClient();
    }
    setShowDeleteDialog(false);
  };

  const handleEditClient = (updatedClient: any) => {
    if (onUpdateClient) {
      onUpdateClient(updatedClient);
    }
    setShowEditDialog(false);
  };

  const handleEditButtonClick = () => {
    setShowEditDialog(true);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBackClick}>
          <ArrowLeft size={16} className="mr-2" />
          Back to Clients
        </Button>
        <div className={`w-12 h-12 bg-gradient-to-r ${clientGradient || 'from-blue-400 to-blue-600'} rounded-full flex items-center justify-center text-white font-bold`}>
          {clientAvatar || clientCompany.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{clientCompany}</h1>
          <p className="text-gray-600">{clientIndustry}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {client && onUpdateClient && (
          <Button variant="outline" size="sm" onClick={handleEditButtonClick}>
            <Edit size={16} className="mr-2" />
            Edit Client
          </Button>
        )}
        
        {onDeleteClient && (
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 size={16} className="mr-2" />
                Delete Client
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Client</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {clientCompany}? This action cannot be undone and will remove all associated data including domains, hosting, and contacts.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                  Delete Client
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {client && (
        <ClientDetails
          client={client}
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onUpdateClient={handleEditClient}
          startInEditMode={true}
        />
      )}
    </div>
  );
};

export default ClientDetailHeader;
