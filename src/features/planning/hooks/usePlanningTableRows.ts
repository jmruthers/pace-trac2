import { useMemo } from 'react';
import {
  buildPlanningTableRows,
  countPlanningRowsByKind,
  filterPlanningTableRows,
  type PlanningKindFilter,
  type PlanningTableRow,
} from '@/features/planning/planning-table-rows';
import {
  useAccommodationList,
  useActivityList,
  useTransportList,
} from '@/features/planning/hooks/useLogisticsList';

export function usePlanningTableRows(kindFilter: PlanningKindFilter = 'all') {
  const transport = useTransportList();
  const accommodation = useAccommodationList();
  const activity = useActivityList();

  const isLoading = transport.isLoading || accommodation.isLoading || activity.isLoading;
  const isError = transport.isError || accommodation.isError || activity.isError;
  const error =
    (transport.error as Error | null) ??
    (accommodation.error as Error | null) ??
    (activity.error as Error | null);

  const allRows = useMemo(
    () =>
      buildPlanningTableRows({
        transport: transport.items,
        accommodation: accommodation.items,
        activity: activity.items,
      }),
    [transport.items, accommodation.items, activity.items]
  );

  const rows = useMemo(
    () => filterPlanningTableRows(allRows, kindFilter),
    [allRows, kindFilter]
  );

  const kindCounts = useMemo(() => countPlanningRowsByKind(allRows), [allRows]);

  return {
    rows,
    allRows,
    kindCounts,
    isLoading,
    isError,
    error,
    refetch: async () => {
      await Promise.all([transport.refetch(), accommodation.refetch(), activity.refetch()]);
    },
  };
}

export type { PlanningTableRow, PlanningKindFilter };
