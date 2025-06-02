
import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      {children}
    </div>
  );
};
