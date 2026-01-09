# Convex File Storage

This project uses Convex's built-in file storage for managing PDFs, logos, and other file uploads.

## Features

- **Secure file storage** - Files are stored in Convex's managed storage
- **Automatic metadata tracking** - File names, sizes, types, and relationships are tracked
- **Easy-to-use React hooks** - Simple hooks for uploading and managing files
- **Pre-built components** - Ready-to-use upload and display components

## File Types

The system supports these file types:
- `logo` - Company logos
- `invoice_pdf` - Invoice PDFs
- `quote_pdf` - Quote PDFs
- `attachment` - General attachments

## Quick Start

### 1. Upload a File

```tsx
import { FileUpload } from '@/components/files/FileUpload';

function MyComponent() {
  return (
    <FileUpload
      accept="application/pdf"
      maxSizeMB={10}
      fileType="invoice_pdf"
      relatedId={invoiceId}
      onUploadComplete={(fileId) => {
        console.log('File uploaded:', fileId);
      }}
    />
  );
}
```

### 2. Display Files

```tsx
import { FileList } from '@/components/files/FileList';

function MyComponent() {
  return (
    <FileList
      fileType="invoice_pdf"
      relatedId={invoiceId}
      showActions={true}
    />
  );
}
```

### 3. Use the Upload Hook

```tsx
import { useFileUpload } from '@/hooks/useFileUpload';

function MyComponent() {
  const { uploadFile, isUploading } = useFileUpload();

  const handleUpload = async (file: File) => {
    await uploadFile(file, {
      fileType: 'logo',
      onSuccess: (fileId) => {
        console.log('Uploaded:', fileId);
      },
    });
  };

  return (
    <input
      type="file"
      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
    />
  );
}
```

### 4. List and Manage Files

```tsx
import { useFiles } from '@/hooks/useFiles';

function MyComponent() {
  const { files, isLoading, deleteFile } = useFiles('logo');

  return (
    <div>
      {files.map(file => (
        <div key={file.id}>
          <span>{file.file_name}</span>
          <button onClick={() => deleteFile(file.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### 5. Get File URL

```tsx
import { useFileUrl } from '@/hooks/useFiles';

function MyComponent({ storageId }: { storageId: string }) {
  const fileUrl = useFileUrl(storageId);

  return fileUrl ? (
    <img src={fileUrl} alt="Logo" />
  ) : (
    <p>Loading...</p>
  );
}
```

## API Reference

### Convex Functions

#### `files.generateUploadUrl`
Generates a temporary upload URL for file uploads.

#### `files.storeFileMetadata`
Stores metadata after a successful upload.
```ts
{
  storageId: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  userId?: string;
  relatedId?: string;
}
```

#### `files.getFileUrl`
Gets a temporary download URL for a file.
```ts
{ storageId: string }
```

#### `files.listFiles`
Lists files with optional filters.
```ts
{
  userId?: string;
  fileType?: string;
  relatedId?: string;
}
```

#### `files.deleteFile`
Deletes a file and its metadata.
```ts
{ id: string; userId?: string }
```

### React Hooks

#### `useFileUpload()`
Hook for uploading files.

Returns:
- `uploadFile(file, options)` - Upload function
- `isUploading` - Upload status
- `uploadProgress` - Upload progress (0-100)

#### `useFiles(fileType?, relatedId?)`
Hook for listing and managing files.

Returns:
- `files` - Array of file metadata
- `isLoading` - Loading state
- `deleteFile(id)` - Delete function

#### `useFileUrl(storageId?)`
Hook for getting a file's download URL.

Returns:
- `fileUrl` - Temporary download URL (or undefined)

## Examples

### Logo Upload for Company Settings

```tsx
import { LogoUpload } from '@/components/settings/LogoUpload';

function CompanySettings() {
  return <LogoUpload />;
}
```

### Invoice PDF Attachment

```tsx
<FileUpload
  accept="application/pdf"
  maxSizeMB={10}
  fileType="invoice_pdf"
  relatedId={invoiceId}
  buttonText="Attach PDF"
/>

<FileList fileType="invoice_pdf" relatedId={invoiceId} />
```

### Custom File Handler

```tsx
const { uploadFile } = useFileUpload();

const handleLogoUpload = async (file: File) => {
  const metadata = await uploadFile(file, {
    fileType: 'logo',
    onSuccess: (fileId) => {
      // Update company settings with the new logo
      updateSettings({ logoFileId: fileId });
    },
  });
};
```

## Storage Limits

- Default max file size: 10MB (configurable)
- Convex storage is included in your plan
- Files are automatically cleaned up when metadata is deleted

## Security

- All file access is authenticated
- Users can only access their own files
- File URLs are temporary and expire
- Storage IDs are opaque and non-guessable
