import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { setupUser } from '@test-utils';
import { ItineraryViewSwitcher } from '@/features/itinerary/components/ItineraryViewSwitcher';

describe('ItineraryViewSwitcher', () => {
  afterEach(() => {
    cleanup();
  });

  it('calls onViewModeChange for planner and participant buttons', async () => {
    const onViewModeChange = vi.fn();
    const user = setupUser();

    render(
      <MemoryRouter>
        <ItineraryViewSwitcher viewMode="planner" onViewModeChange={onViewModeChange} />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Participant view' }));
    expect(onViewModeChange).toHaveBeenCalledWith('participant');

    await user.click(screen.getByRole('button', { name: 'Planner view' }));
    expect(onViewModeChange).toHaveBeenCalledWith('planner');
  });
});
