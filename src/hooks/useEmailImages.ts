// TODO: Migrate to Convex file storage or external service (Cloudinary, S3)
export const useEmailImages = () => {
  return {
    images: [],
    isLoading: false,
    uploadImage: () => { throw new Error('File upload not yet migrated to Convex'); },
    updateImage: () => { throw new Error('File upload not yet migrated to Convex'); },
    deleteImage: () => { throw new Error('File upload not yet migrated to Convex'); },
    isUploading: false,
    isUpdating: false,
    isDeleting: false,
    getImageUrl: (filePath: string) => '',
  };
};
