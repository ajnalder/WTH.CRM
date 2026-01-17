import React, { useRef, useState } from 'react';
import { Image, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface QuoteHeaderProps {
  clientName: string;
  contactName?: string | null;
  title: string;
  projectType?: string | null;
  creatorName?: string | null;
  creatorEmail?: string | null;
  coverImageUrl?: string | null;
  logoBase64?: string | null;
  logoInverseBase64?: string | null;
  companyName?: string | null;
  onCoverImageChange?: (url: string | null) => void;
  editable?: boolean;
}

export function QuoteHeader({
  clientName,
  contactName,
  title,
  projectType,
  creatorName,
  creatorEmail,
  coverImageUrl,
  logoBase64,
  logoInverseBase64,
  companyName,
  onCoverImageChange,
  editable = false,
}: QuoteHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onCoverImageChange) return;

    setIsUploading(true);
    try {
      // TODO: Implement file upload with Convex file storage or external service (Cloudinary, S3, etc.)
      // For now, we'll use a data URL as a temporary solution
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onCoverImageChange(event.target.result as string);
          toast({ title: 'Cover image uploaded (temporary - stored as data URL)' });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Error', description: 'Failed to upload cover image', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveCover = () => {
    if (onCoverImageChange) {
      onCoverImageChange(null);
    }
  };

  const displayTitle = title
    ? `${clientName} | ${title}`
    : clientName;

  // Default cover image
  const defaultCover = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80';
  const backgroundImage = coverImageUrl || defaultCover;

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      {/* Cover Image */}
      <div
        className="relative h-[400px] bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Edit Controls */}
        {editable && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="bg-background/90 hover:bg-background"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Image className="mr-2 h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Change Cover'}
            </Button>
            {coverImageUrl && (
              <Button
                variant="secondary"
                size="icon"
                className="bg-background/90 hover:bg-background h-8 w-8"
                onClick={handleRemoveCover}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-8 text-white">
          {/* Top Section - Logo only */}
          <div className="flex items-start justify-between">
            {/* Logo - prefer inverse logo for dark backgrounds */}
            <div>
              {(logoInverseBase64 || logoBase64) ? (
                <img
                  src={logoInverseBase64 || logoBase64}
                  alt="Company Logo"
                  className="h-10"
                />
              ) : (
                <div className="text-xl font-bold">{companyName || 'Company'}</div>
              )}
            </div>
          </div>

          {/* Center Title */}
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              {displayTitle}
            </h1>
          </div>

          {/* Bottom Section - By and Prepared For */}
          <div className="flex items-end justify-between">
            {/* By */}
            <div>
              <div className="text-sm opacity-80">By</div>
              <div className="text-lg font-semibold">{creatorName || 'Unknown'}</div>
            </div>

            {/* Prepared For */}
            {contactName && (
              <div className="text-right">
                <div className="text-sm italic opacity-80">Prepared For</div>
                <div className="text-lg font-semibold">{contactName}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
