import { describe, expect, it } from 'vitest';
import {
  buildItineraryParticipantOptions,
  resolveDefaultParticipantId,
} from '@/features/itinerary/itinerary-participant-options';
import type { ApprovedApplication } from '@/features/assignments/types';
import type { AssignmentRow } from '@/features/assignments/types';

const applications: ApprovedApplication[] = [
  {
    id: 'app-1',
    event_id: 'event-1',
    status: 'approved',
    first_name: 'Alex',
    surname: 'Example',
    preferred_name: null,
  },
  {
    id: 'app-2',
    event_id: 'event-1',
    status: 'approved',
    first_name: 'Sam',
    surname: 'Sample',
    preferred_name: null,
  },
];

const assignments: AssignmentRow[] = [
  {
    id: 'assign-1',
    application_id: 'app-2',
    resource_type: 'transport',
    resource_id: 'transport-1',
    event_id: 'event-1',
    organisation_id: 'org-1',
    notes: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    created_by: null,
    updated_by: null,
  },
];

describe('itinerary participant options', () => {
  it('filters approved applications to those with assignments', () => {
    expect(buildItineraryParticipantOptions(applications, assignments)).toEqual([
      { id: 'app-2', label: 'Sam Sample' },
    ]);
  });

  it('resolveDefaultParticipantId keeps valid selection or falls back to first option', () => {
    const options = buildItineraryParticipantOptions(applications, assignments);
    expect(resolveDefaultParticipantId(options, 'app-1')).toBe('app-2');
    expect(resolveDefaultParticipantId(options, 'app-2')).toBe('app-2');
  });
});
