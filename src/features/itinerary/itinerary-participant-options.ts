import type { ApprovedApplication } from '@/features/assignments/types';
import type { AssignmentRow } from '@/features/assignments/types';
import { formatParticipantLabel } from '@/features/assignments/participant-label';

export interface ItineraryParticipantOption {
  id: string;
  label: string;
}

export function buildItineraryParticipantOptions(
  applications: ApprovedApplication[],
  assignments: AssignmentRow[]
): ItineraryParticipantOption[] {
  const assignedIds = new Set(assignments.map((row) => row.application_id));
  return applications
    .filter((app) => assignedIds.has(app.id))
    .map((app) => ({
      id: app.id,
      label: formatParticipantLabel(app),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function resolveDefaultParticipantId(
  options: ItineraryParticipantOption[],
  preferredId: string | null
): string | null {
  if (options.length === 0) return null;
  if (preferredId != null && options.some((option) => option.id === preferredId)) {
    return preferredId;
  }
  return options[0]?.id ?? null;
}
