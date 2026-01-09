# Logo Storage Migration

## Overview

Company logos have been migrated from base64 database storage to Convex file storage for better performance and scalability.

## What Changed

### Database Schema
Added new fields to `company_settings` table:
- `logo_storage_id` - Storage ID for the main logo
- `logo_inverse_storage_id` - Storage ID for the inverse logo

Legacy fields remain for backward compatibility:
- `logo_base64` (legacy)
- `logo_inverse_base64` (legacy)

### New Components

#### CompanySettingsWithStorage
New component that uses Convex storage for logo uploads. Located at:
`src/components/CompanySettingsWithStorage.tsx`

Features:
- Uploads logos to Convex storage
- Displays logos from storage or fallback to base64
- Shows upload progress
- Maintains backward compatibility

#### useCompanyLogo Hook
Helper hook to easily access logos from anywhere in the app:
```tsx
import { useCompanyLogo } from '@/hooks/useCompanyLogo';

function MyComponent() {
  const { logo, logoInverse, hasLogo } = useCompanyLogo();

  return <img src={logo} alt="Company Logo" />;
}
```

## How It Works

### Upload Flow

1. User selects a logo file
2. File is uploaded to Convex storage using `useFileUpload` hook
3. Storage ID is saved to `company_settings` table
4. Old base64 data is cleared (optional, for space savings)

### Display Flow

1. Component checks for `logo_storage_id` first
2. If storage ID exists, fetch URL from Convex storage
3. If no storage ID, fallback to `logo_base64`
4. Display the logo from whichever source is available

## Backward Compatibility

✅ **Existing logos continue to work**
- Old base64 logos still display correctly
- No data migration required
- Logos are migrated automatically on next upload

✅ **Gradual migration**
- New uploads use storage system
- Old logos remain until updated
- Both systems work side-by-side

## Benefits

### Performance
- ✅ Faster database queries (no large base64 strings)
- ✅ Reduced database size
- ✅ Better caching with file URLs

### Features
- ✅ File management (view, download, delete)
- ✅ Upload progress indication
- ✅ Support for larger files
- ✅ Separate file metadata tracking

### Developer Experience
- ✅ Simple hooks: `useCompanyLogo()`
- ✅ Reusable components: `FileUpload`
- ✅ Type-safe file operations

## Migration Checklist

- [x] Add storage ID fields to schema
- [x] Update Convex mutations to accept storage IDs
- [x] Create new CompanySettingsWithStorage component
- [x] Update Settings page to use new component
- [x] Create useCompanyLogo helper hook
- [x] Test logo upload and display
- [x] Verify backward compatibility with base64 logos

## Usage Examples

### Upload Logo
```tsx
import { useFileUpload } from '@/hooks/useFileUpload';
import { useCompanySettings } from '@/hooks/useCompanySettings';

function LogoUploader() {
  const { uploadFile } = useFileUpload();
  const { updateSettings } = useCompanySettings();

  const handleUpload = async (file: File) => {
    const metadata = await uploadFile(file, {
      fileType: 'logo',
    });

    await updateSettings({
      logo_storage_id: metadata.storage_id,
      logo_base64: undefined, // Clear old base64
    });
  };

  return <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />;
}
```

### Display Logo
```tsx
import { useCompanyLogo } from '@/hooks/useCompanyLogo';

function Header() {
  const { logo, hasLogo } = useCompanyLogo();

  return (
    <header>
      {hasLogo && <img src={logo} alt="Company Logo" />}
    </header>
  );
}
```

### Use in Invoice PDFs
```tsx
import { useCompanyLogo } from '@/hooks/useCompanyLogo';

function InvoicePDF() {
  const { logo, logoInverse } = useCompanyLogo();

  return (
    <div>
      {/* Light background - use main logo */}
      <img src={logo} />

      {/* Dark background - use inverse logo */}
      <div className="bg-dark">
        <img src={logoInverse} />
      </div>
    </div>
  );
}
```

## File Types

Logo files are stored with `fileType: 'logo'` in the files table. This allows:
- Easy filtering: `useFiles('logo')`
- Dedicated logo management
- Separation from other file types

## Cleanup (Optional)

To clean up old base64 data and save database space:

```tsx
// After migrating a logo to storage
await updateSettings({
  logo_storage_id: newStorageId,
  logo_base64: undefined, // Remove old base64
});
```

This is optional and can be done gradually. The system works with both.

## Future Enhancements

Potential improvements:
- [ ] Automatic image optimization (resize, compress)
- [ ] Multiple logo variants (favicon, social media, etc.)
- [ ] Logo versioning/history
- [ ] Bulk migration script for existing base64 logos
- [ ] Logo usage analytics

## Support

For issues or questions:
1. Check `docs/FILE_STORAGE.md` for general file storage documentation
2. Review `src/hooks/useCompanyLogo.ts` for implementation details
3. See `src/components/CompanySettingsWithStorage.tsx` for usage example
