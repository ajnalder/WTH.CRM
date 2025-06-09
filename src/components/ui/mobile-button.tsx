
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { cn } from '@/lib/utils';

interface MobileButtonProps extends ButtonProps {
  hapticFeedback?: boolean;
  touchOptimized?: boolean;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  className,
  hapticFeedback = false,
  touchOptimized = true,
  onClick,
  children,
  ...props
}) => {
  const { isMobileDevice, vibrate } = useMobileOptimization();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (hapticFeedback && isMobileDevice) {
      vibrate(50); // Short vibration for feedback
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  const mobileClasses = isMobileDevice && touchOptimized
    ? 'min-h-[44px] min-w-[44px] touch-manipulation active:scale-95 transition-transform duration-100'
    : '';

  return (
    <Button
      className={cn(mobileClasses, className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
};
