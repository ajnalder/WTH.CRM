// TODO: Migrate to Convex - currently stubbed
export const useTimeSlots = (selectedDate: Date) => {
  return {
    timeSlots: [],
    isLoading: false,
    refetchTimeSlots: () => Promise.resolve(),
  };
};
