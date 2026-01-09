import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/files/FileUpload';
import { FileList } from '@/components/files/FileList';

export const LogoUpload: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Logo</CardTitle>
        <CardDescription>
          Upload your company logo for use on invoices and quotes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileUpload
          accept="image/*"
          maxSizeMB={5}
          fileType="logo"
          buttonText="Upload Logo"
          onUploadComplete={(fileId) => {
            console.log('Logo uploaded:', fileId);
          }}
        />

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3">Uploaded Logos</h4>
          <FileList fileType="logo" />
        </div>
      </CardContent>
    </Card>
  );
};
