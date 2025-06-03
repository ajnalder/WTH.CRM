
import React from 'react';
import { cn } from '@/lib/utils';

interface ShadowBoxProps {
  children: React.ReactNode;
  className?: string;
}

export const ShadowBox: React.FC<ShadowBoxProps> = ({ children, className }) => {
  return (
    <div className={cn("bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-0", className)}>
      {children}
    </div>
  );
};
