// TODO: Migrate to Convex - currently stubbed
export const useHosting = (clientId: string) => {
  return {
    hosting: [],
    isLoading: false,
    error: null,
    createHosting: () => {},
    deleteHosting: () => {},
    isCreating: false,
    isDeleting: false,
  };
};
