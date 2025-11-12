
import { useState } from 'react';
import { NewDomainForm, NewHostingForm, NewContactForm } from '@/types/clientDetail';

export const useClientDetailForms = () => {
  const [newDomain, setNewDomain] = useState<NewDomainForm>({
    name: '',
    registrar: '',
    expiry_date: '',
    platform: 'Webflow',
    renewal_cost: 0,
    client_managed: false,
    notes: ''
  });

  const [newHosting, setNewHosting] = useState<NewHostingForm>({
    provider: '',
    plan: '',
    platform: 'Other',
    renewal_date: '',
    login_url: '',
    notes: '',
    renewal_cost: null
  });

  const [newContact, setNewContact] = useState<NewContactForm>({
    name: '',
    email: '',
    phone: '',
    role: '',
    is_primary: false
  });

  const resetDomainForm = () => {
    setNewDomain({
      name: '',
      registrar: '',
      expiry_date: '',
      platform: 'Webflow',
      renewal_cost: 0,
      client_managed: false,
      notes: ''
    });
  };

  const resetHostingForm = () => {
    setNewHosting({
      provider: '',
      plan: '',
      platform: 'Other',
      renewal_date: '',
      login_url: '',
      notes: '',
      renewal_cost: null
    });
  };

  const resetContactForm = () => {
    setNewContact({
      name: '',
      email: '',
      phone: '',
      role: '',
      is_primary: false
    });
  };

  return {
    newDomain,
    setNewDomain,
    newHosting,
    setNewHosting,
    newContact,
    setNewContact,
    resetDomainForm,
    resetHostingForm,
    resetContactForm
  };
};
