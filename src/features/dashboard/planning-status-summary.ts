import { isTracStatus, type TracStatus } from '@/features/planning/enums';

export interface PlanningStatusRow {
  status: TracStatus | string | null;
}

export interface PlanningStatusSummary {
  confirmed: number;
  total: number;
}

const CONFIRMED_STATUS: TracStatus = 'confirmed';

/**
 * Confirmed vs total counts for dashboard planning card (enum-safe).
 * Invalid status values count toward total but not confirmed.
 */
export function summarizePlanningStatusCounts(
  rows: readonly PlanningStatusRow[]
): PlanningStatusSummary {
  let confirmed = 0;
  for (const row of rows) {
    const status = row.status;
    if (status != null && !isTracStatus(status)) {
      console.error('[trac-dashboard] Invalid trac_status value:', status);
      continue;
    }
    if (status === CONFIRMED_STATUS) {
      confirmed += 1;
    }
  }
  return { confirmed, total: rows.length };
}
