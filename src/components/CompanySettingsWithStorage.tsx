import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useFileUrl } from '@/hooks/useFiles';
import { Upload, X } from 'lucide-react';

export const CompanySettingsWithStorage: React.FC = () => {
  const { settings, updateSettings, isLoading, isUpdating } = useCompanySettings();
  const { uploadFile, isUploading } = useFileUpload();

  const [formData, setFormData] = useState({
    company_name: settings?.company_name || 'What the Heck',
    owner_name: settings?.owner_name || '',
    address_line1: settings?.address_line1 || '8 King Street',
    address_line2: settings?.address_line2 || 'Te Puke 3119',
    address_line3: settings?.address_line3 || 'NEW ZEALAND',
    gst_number: settings?.gst_number || '125-651-445',
    bank_details: settings?.bank_details || 'Direct Credit - Mackay Distribution 2018 Limited',
    bank_account: settings?.bank_account || '06-0556-0955531-00',
  });

  // Get logo URLs from storage IDs (if using new storage system)
  const logoUrl = useFileUrl(settings?.logo_storage_id);
  const logoInverseUrl = useFileUrl(settings?.logo_inverse_storage_id);

  // Determine which logo to display (prefer storage over base64)
  const displayLogoUrl = logoUrl || settings?.logo_base64;
  const displayLogoInverseUrl = logoInverseUrl || settings?.logo_inverse_base64;

  useEffect(() => {
    if (settings) {
      setFormData({
        company_name: settings.company_name || '',
        owner_name: settings.owner_name || '',
        address_line1: settings.address_line1 || '',
        address_line2: settings.address_line2 || '',
        address_line3: settings.address_line3 || '',
        gst_number: settings.gst_number || '',
        bank_details: settings.bank_details || '',
        bank_account: settings.bank_account || '',
      });
    }
  }, [settings]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const metadata = await uploadFile(file, {
        fileType: 'logo',
        onSuccess: (fileId) => {
          console.log('Logo uploaded:', fileId);
        },
      });

      // Update settings with the storage ID
      await updateSettings({
        logo_storage_id: metadata.storage_id,
        // Clear old base64 to save space (optional)
        logo_base64: undefined,
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
    }
  };

  const handleInverseLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const metadata = await uploadFile(file, {
        fileType: 'logo',
        onSuccess: (fileId) => {
          console.log('Inverse logo uploaded:', fileId);
        },
      });

      // Update settings with the storage ID
      await updateSettings({
        logo_inverse_storage_id: metadata.storage_id,
        // Clear old base64 to save space (optional)
        logo_inverse_base64: undefined,
      });
    } catch (error) {
      console.error('Error uploading inverse logo:', error);
    }
  };

  const handleSave = () => {
    updateSettings(formData);
  };

  if (isLoading) {
    return <div>Loading company settings...</div>;
  }

  return (
    <div className="p-2">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Company Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload - Standard (for light backgrounds) */}
          <div>
            <Label htmlFor="logo">Logo (Light Background)</Label>
            <p className="text-sm text-muted-foreground mb-2">Used on invoices and light backgrounds</p>
            <div className="mt-2 space-y-3">
              {displayLogoUrl && (
                <div className="relative inline-block">
                  <img
                    src={displayLogoUrl}
                    alt="Company Logo"
                    className="h-16 w-auto border rounded bg-white p-2"
                  />
                </div>
              )}
              <div>
                <input
                  type="file"
                  id="logo"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('logo')?.click()}
                  disabled={isUpdating || isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : displayLogoUrl ? 'Change Logo' : 'Upload Logo'}
                </Button>
              </div>
            </div>
          </div>

          {/* Inverse Logo Upload (for dark backgrounds) */}
          <div>
            <Label htmlFor="logo_inverse">Logo (Dark Background)</Label>
            <p className="text-sm text-muted-foreground mb-2">Used on quotes and dark backgrounds - typically a white/light version</p>
            <div className="mt-2 space-y-3">
              {displayLogoInverseUrl && (
                <div className="relative inline-block">
                  <img
                    src={displayLogoInverseUrl}
                    alt="Company Logo (Inverse)"
                    className="h-16 w-auto border rounded bg-gray-800 p-2"
                  />
                </div>
              )}
              <div>
                <input
                  type="file"
                  id="logo_inverse"
                  accept="image/*"
                  onChange={handleInverseLogoUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('logo_inverse')?.click()}
                  disabled={isUpdating || isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : displayLogoInverseUrl ? 'Change Inverse Logo' : 'Upload Inverse Logo'}
                </Button>
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div>
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="owner_name">Owner/Contact Name</Label>
            <Input
              id="owner_name"
              value={formData.owner_name}
              onChange={(e) => handleInputChange('owner_name', e.target.value)}
              placeholder="Your name for client-facing documents"
            />
          </div>

          <div>
            <Label htmlFor="address_line1">Address Line 1</Label>
            <Input
              id="address_line1"
              value={formData.address_line1}
              onChange={(e) => handleInputChange('address_line1', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="address_line2">Address Line 2</Label>
            <Input
              id="address_line2"
              value={formData.address_line2}
              onChange={(e) => handleInputChange('address_line2', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="address_line3">Address Line 3</Label>
            <Input
              id="address_line3"
              value={formData.address_line3}
              onChange={(e) => handleInputChange('address_line3', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="gst_number">GST Number</Label>
            <Input
              id="gst_number"
              value={formData.gst_number}
              onChange={(e) => handleInputChange('gst_number', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="bank_details">Bank Details</Label>
            <Input
              id="bank_details"
              value={formData.bank_details}
              onChange={(e) => handleInputChange('bank_details', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="bank_account">Bank Account</Label>
            <Input
              id="bank_account"
              value={formData.bank_account}
              onChange={(e) => handleInputChange('bank_account', e.target.value)}
            />
          </div>

          <Button onClick={handleSave} disabled={isUpdating} className="w-full">
            {isUpdating ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
