import { useFileUrl } from './useFiles';
import { useCompanySettings } from './useCompanySettings';

/**
 * Hook to get company logo URL - supports both legacy base64 and new storage
 */
export const useCompanyLogo = () => {
  const { settings } = useCompanySettings();

  // Get URLs from storage if available
  const logoUrl = useFileUrl(settings?.logo_storage_id);
  const logoInverseUrl = useFileUrl(settings?.logo_inverse_storage_id);

  // Prefer storage URL over base64 (storage is more efficient)
  const logo = logoUrl || settings?.logo_base64;
  const logoInverse = logoInverseUrl || settings?.logo_inverse_base64;

  return {
    logo,
    logoInverse,
    hasLogo: Boolean(logo),
    hasLogoInverse: Boolean(logoInverse),
    // Return storage IDs for direct access if needed
    logoStorageId: settings?.logo_storage_id,
    logoInverseStorageId: settings?.logo_inverse_storage_id,
  };
};
