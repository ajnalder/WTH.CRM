
import { useState } from 'react';

export const useClientDetailDialogs = () => {
  const [showDomainDialog, setShowDomainDialog] = useState(false);
  const [showHostingDialog, setShowHostingDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);

  return {
    showDomainDialog,
    setShowDomainDialog,
    showHostingDialog,
    setShowHostingDialog,
    showContactDialog,
    setShowContactDialog
  };
};
