import { describe, expect, it } from 'vitest';
import { buildNotesByResourceKey } from '@/features/itinerary/build-assignment-notes';
import type { AssignmentRow } from '@/features/assignments/types';

const rows: AssignmentRow[] = [
  {
    id: 'assign-1',
    application_id: 'app-1',
    resource_type: 'transport',
    resource_id: 'transport-1',
    event_id: 'event-1',
    organisation_id: 'org-1',
    notes: '  Window seat  ',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    created_by: null,
    updated_by: null,
  },
  {
    id: 'assign-2',
    application_id: 'app-2',
    resource_type: 'activity',
    resource_id: 'activity-1',
    event_id: 'event-1',
    organisation_id: 'org-1',
    notes: 'Other participant note',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    created_by: null,
    updated_by: null,
  },
];

describe('buildNotesByResourceKey', () => {
  it('returns notes only for the selected participant application', () => {
    expect(buildNotesByResourceKey(rows, 'app-1')).toEqual({
      'transport:transport-1': 'Window seat',
    });
  });

  it('returns empty map when participant id is null', () => {
    expect(buildNotesByResourceKey(rows, null)).toEqual({});
  });
});
