
import React from 'react';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { cn } from '@/lib/utils';

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  touchOptimized?: boolean;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  className,
  padding = 'md',
  touchOptimized = true
}) => {
  const { isMobileDevice, orientation } = useMobileOptimization();

  const getPaddingClasses = () => {
    if (padding === 'none') return '';
    
    const basePadding = {
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6'
    }[padding];

    // Add extra padding on mobile for better touch experience
    const mobilePadding = isMobileDevice ? {
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-7'
    }[padding] : basePadding;

    return mobilePadding;
  };

  const mobileClasses = cn(
    getPaddingClasses(),
    isMobileDevice && touchOptimized && 'touch-manipulation',
    isMobileDevice && orientation === 'landscape' && 'px-6', // Extra horizontal padding in landscape
    className
  );

  return (
    <div className={mobileClasses}>
      {children}
    </div>
  );
};
