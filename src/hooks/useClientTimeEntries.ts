// TODO: Migrate to Convex - currently stubbed
export const useClientTimeEntries = (clientId: string) => {
  return {
    data: { tasks: [], totalHours: 0, totalEntries: 0 },
    isLoading: false,
    error: null,
  };
};
