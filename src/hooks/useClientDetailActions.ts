
import { useClientDetailForms } from './useClientDetailForms';
import { useClientDetailDialogs } from './useClientDetailDialogs';

interface UseClientDetailActionsProps {
  clientId: string;
  createDomain: (data: any) => void;
  createHosting: (data: any) => void;
  createContact: (data: any) => void;
}

export const useClientDetailActions = ({
  clientId,
  createDomain,
  createHosting,
  createContact
}: UseClientDetailActionsProps) => {
  const forms = useClientDetailForms();
  const dialogs = useClientDetailDialogs();

  const addDomain = () => {
    if (forms.newDomain.name && forms.newDomain.registrar && clientId) {
      createDomain({
        client_id: clientId,
        ...forms.newDomain
      });
      forms.resetDomainForm();
      dialogs.setShowDomainDialog(false);
    }
  };

  const addHosting = () => {
    if (forms.newHosting.provider && forms.newHosting.plan && clientId) {
      const hostingData = {
        client_id: clientId,
        ...forms.newHosting,
        renewal_date: forms.newHosting.renewal_date || null,
        renewal_cost: forms.newHosting.renewal_cost
      };
      
      createHosting(hostingData);
      forms.resetHostingForm();
      dialogs.setShowHostingDialog(false);
    }
  };

  const addContact = () => {
    if (forms.newContact.name && forms.newContact.email && clientId) {
      createContact({
        client_id: clientId,
        ...forms.newContact
      });
      forms.resetContactForm();
      dialogs.setShowContactDialog(false);
    }
  };

  return {
    ...forms,
    ...dialogs,
    addDomain,
    addHosting,
    addContact
  };
};
