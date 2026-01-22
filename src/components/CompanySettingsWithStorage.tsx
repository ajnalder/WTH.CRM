import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
    klaviyo_from_email: settings?.klaviyo_from_email || '',
    klaviyo_from_label: settings?.klaviyo_from_label || '',
    klaviyo_default_audience_id: settings?.klaviyo_default_audience_id || '',
    klaviyo_placed_order_metric_id: settings?.klaviyo_placed_order_metric_id || '',
  });
  const [audiences, setAudiences] = useState<{ id: string; label: string }[]>(
    settings?.klaviyo_audiences?.map((audience) => ({
      id: audience.id,
      label: audience.label || '',
    })) || []
  );

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
        klaviyo_from_email: settings.klaviyo_from_email || '',
        klaviyo_from_label: settings.klaviyo_from_label || '',
        klaviyo_default_audience_id: settings.klaviyo_default_audience_id || '',
        klaviyo_placed_order_metric_id: settings.klaviyo_placed_order_metric_id || '',
      });
      setAudiences(
        settings.klaviyo_audiences?.map((audience) => ({
          id: audience.id,
          label: audience.label || '',
        })) || []
      );
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
    const cleanedAudiences = audiences
      .map((audience) => ({
        id: audience.id.trim(),
        label: audience.label.trim() || undefined,
      }))
      .filter((audience) => audience.id);

    updateSettings({
      ...formData,
      klaviyo_audiences: cleanedAudiences,
    });
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

          <div className="border-t pt-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Klaviyo Settings</h3>
              <p className="text-sm text-muted-foreground">
                Manage sender details and audience options for campaign creation.
              </p>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="klaviyo_from_email">From email</Label>
                <Input
                  id="klaviyo_from_email"
                  value={formData.klaviyo_from_email}
                  onChange={(e) => handleInputChange('klaviyo_from_email', e.target.value)}
                  placeholder="edm@golf360.co.nz"
                />
              </div>
              <div>
                <Label htmlFor="klaviyo_from_label">From label</Label>
                <Input
                  id="klaviyo_from_label"
                  value={formData.klaviyo_from_label}
                  onChange={(e) => handleInputChange('klaviyo_from_label', e.target.value)}
                  placeholder="Golf 360"
                />
              </div>
              <div>
                <Label htmlFor="klaviyo_default_audience_id">Default audience</Label>
                <Select
                  value={formData.klaviyo_default_audience_id}
                  onValueChange={(value) =>
                    handleInputChange('klaviyo_default_audience_id', value)
                  }
                  disabled={audiences.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select default audience" />
                  </SelectTrigger>
                  <SelectContent>
                    {audiences
                      .filter((audience) => audience.id.trim())
                      .map((audience, index) => (
                        <SelectItem key={`${audience.id}-${index}`} value={audience.id}>
                          {audience.label || audience.id}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="klaviyo_placed_order_metric_id">Placed order metric ID</Label>
                <Input
                  id="klaviyo_placed_order_metric_id"
                  value={formData.klaviyo_placed_order_metric_id}
                  onChange={(e) =>
                    handleInputChange('klaviyo_placed_order_metric_id', e.target.value)
                  }
                  placeholder="RESQ6t"
                />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <Label>Audiences</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setAudiences((prev) => [...prev, { id: '', label: '' }])
                  }
                >
                  Add audience
                </Button>
              </div>
              <div className="space-y-3">
                {audiences.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No audiences yet. Add at least one to enable Klaviyo creation.
                  </p>
                )}
                {audiences.map((audience, index) => (
                  <div key={`audience-${index}`} className="grid gap-2 md:grid-cols-3">
                    <Input
                      value={audience.label}
                      onChange={(e) => {
                        const next = [...audiences];
                        next[index] = { ...next[index], label: e.target.value };
                        setAudiences(next);
                      }}
                      placeholder="Audience name"
                    />
                    <Input
                      value={audience.id}
                      onChange={(e) => {
                        const next = [...audiences];
                        next[index] = { ...next[index], id: e.target.value };
                        setAudiences(next);
                      }}
                      placeholder="Audience ID"
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        setAudiences((prev) => prev.filter((_, i) => i !== index))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={isUpdating} className="w-full">
            {isUpdating ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
