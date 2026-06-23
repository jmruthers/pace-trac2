import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ItineraryParticipantBanner } from '@/features/itinerary/components/ItineraryParticipantBanner';

describe('ItineraryParticipantBanner', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders participant name in title and select options', () => {
    render(
      <ItineraryParticipantBanner
        participantName="Alex Example"
        options={[
          { id: 'app-1', label: 'Alex Example' },
          { id: 'app-2', label: 'Sam Sample' },
        ]}
        selectedParticipantId="app-1"
        onSelectParticipantId={vi.fn()}
        showPicker
      />
    );

    expect(screen.getByText(/Participant itinerary — Alex Example/i)).toBeInTheDocument();
    expect(screen.getByText('Viewing as')).toBeInTheDocument();
  });

  it('hides picker when showPicker is false', () => {
    render(
      <ItineraryParticipantBanner
        participantName="Alex Example"
        options={[{ id: 'app-1', label: 'Alex Example' }]}
        selectedParticipantId="app-1"
        onSelectParticipantId={vi.fn()}
        showPicker={false}
      />
    );

    expect(screen.queryByText('Viewing as')).not.toBeInTheDocument();
  });
});
