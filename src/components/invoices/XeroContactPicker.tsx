import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface XeroContact {
  contact_id: string;
  name: string;
  email: string;
  phone: string;
}

interface XeroContactPickerProps {
  clientName: string;
  availableContacts: XeroContact[];
  onSelect: (contactId: string) => void;
  disabled?: boolean;
}

// Helper to calculate similarity score between two strings
const getSimilarityScore = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  // Exact match
  if (s1 === s2) return 100;
  
  // Check if one contains the other
  if (s1.includes(s2) || s2.includes(s1)) return 80;
  
  // Check if they start with the same characters
  const minLength = Math.min(s1.length, s2.length);
  let matchingChars = 0;
  for (let i = 0; i < minLength; i++) {
    if (s1[i] === s2[i]) matchingChars++;
    else break;
  }
  if (matchingChars >= 2) return 50 + matchingChars * 5;
  
  // Check first letter match
  if (s1[0] === s2[0]) return 30;
  
  // Check if any significant words match
  const words1 = s1.split(/\s+/).filter(w => w.length > 2);
  const words2 = s2.split(/\s+/).filter(w => w.length > 2);
  for (const w1 of words1) {
    for (const w2 of words2) {
      if (w1 === w2) return 60;
      if (w1.includes(w2) || w2.includes(w1)) return 40;
    }
  }
  
  return 0;
};

export const XeroContactPicker: React.FC<XeroContactPickerProps> = ({
  clientName,
  availableContacts,
  onSelect,
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Sort contacts by similarity to client name, with best matches first
  const sortedContacts = useMemo(() => {
    return [...availableContacts]
      .map(contact => ({
        ...contact,
        score: getSimilarityScore(contact.name, clientName)
      }))
      .sort((a, b) => b.score - a.score);
  }, [availableContacts, clientName]);

  // When popover opens, pre-fill search with client name for instant filtering
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      // Pre-fill with first word of client name for smart filtering
      const firstWord = clientName.split(/\s+/)[0] || '';
      setSearch(firstWord);
    } else {
      setSearch('');
    }
  };

  const handleSelect = (contactId: string) => {
    onSelect(contactId);
    setOpen(false);
    setSearch('');
  };

  if (availableContacts.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled className="w-48 justify-between">
        No contacts available
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-48 justify-between"
        >
          Link to Xero
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 bg-popover" align="end">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search contacts..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No contact found.</CommandEmpty>
            <CommandGroup>
              {sortedContacts
                .filter(contact => 
                  !search || 
                  contact.name.toLowerCase().includes(search.toLowerCase())
                )
                .map((contact) => (
                  <CommandItem
                    key={contact.contact_id}
                    value={contact.contact_id}
                    onSelect={() => handleSelect(contact.contact_id)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className={cn(
                        "font-medium",
                        contact.score >= 50 && "text-primary"
                      )}>
                        {contact.name}
                      </span>
                      {contact.email && (
                        <span className="text-xs text-muted-foreground">{contact.email}</span>
                      )}
                    </div>
                    {contact.score >= 80 && (
                      <Check className="ml-auto h-4 w-4 text-green-600" />
                    )}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
