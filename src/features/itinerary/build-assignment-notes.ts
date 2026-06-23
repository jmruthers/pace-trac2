import type { AssignmentRow } from '@/features/assignments/types';
import { resourceKey } from '@/features/itinerary/map-logistics-to-itinerary-input';

export function buildNotesByResourceKey(
  assignments: AssignmentRow[],
  participantApplicationId: string | null
): Record<string, string> {
  const notes: Record<string, string> = {};
  if (participantApplicationId == null) return notes;

  for (const row of assignments) {
    if (row.application_id !== participantApplicationId) continue;
    const note = row.notes?.trim();
    if (note == null || note === '') continue;
    notes[resourceKey(row.resource_type, row.resource_id)] = note;
  }

  return notes;
}
