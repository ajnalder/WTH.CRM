
import { useState, useEffect, useCallback } from 'react';
import { isMobile, isIOS, isMobileSafari } from '@/utils/mobileDetection';

interface UseMobileOptimizationReturn {
  isMobileDevice: boolean;
  isIOSDevice: boolean;
  isMobileSafariDevice: boolean;
  touchSupport: boolean;
  orientation: 'portrait' | 'landscape';
  isOnline: boolean;
  vibrate: (pattern?: number | number[]) => void;
  addToHomeScreen: () => void;
  canAddToHomeScreen: boolean;
}

export const useMobileOptimization = (): UseMobileOptimizationReturn => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [canAddToHomeScreen, setCanAddToHomeScreen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const isMobileDevice = isMobile();
  const isIOSDevice = isIOS();
  const isMobileSafariDevice = isMobileSafari();
  const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Handle orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    handleOrientationChange(); // Set initial value
    window.addEventListener('resize', handleOrientationChange);
    
    return () => window.removeEventListener('resize', handleOrientationChange);
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanAddToHomeScreen(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const vibrate = useCallback((pattern: number | number[] = 100) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const addToHomeScreen = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to A2HS prompt: ${outcome}`);
      setDeferredPrompt(null);
      setCanAddToHomeScreen(false);
    }
  }, [deferredPrompt]);

  return {
    isMobileDevice,
    isIOSDevice,
    isMobileSafariDevice,
    touchSupport,
    orientation,
    isOnline,
    vibrate,
    addToHomeScreen,
    canAddToHomeScreen
  };
};
