
import React from 'react';

interface ClientDetailTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ClientDetailTabs = ({ activeTab, onTabChange }: ClientDetailTabsProps) => {
  const tabs = ['overview', 'projects', 'domains', 'hosting', 'contacts', 'invoices'];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
              activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ClientDetailTabs;
