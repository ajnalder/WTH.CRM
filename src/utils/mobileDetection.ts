
/**
 * Mobile detection and device-specific utilities
 */
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isSafari = (): boolean => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

export const isMobileSafari = (): boolean => {
  return isIOS() && isSafari();
};

export const getMobileVoiceConfig = () => {
  const mobile = isMobile();
  const mobileSafari = isMobileSafari();
  
  return {
    continuous: mobile ? false : true, // Use tap-to-talk on mobile
    interimResults: mobile ? false : true, // Simpler results on mobile
    silenceTimeout: mobile ? 3000 : 2000, // Longer timeout for mobile
    retryAttempts: mobile ? 3 : 1,
    chunkSize: mobileSafari ? 2048 : 4096 // Smaller chunks for mobile Safari
  };
};
