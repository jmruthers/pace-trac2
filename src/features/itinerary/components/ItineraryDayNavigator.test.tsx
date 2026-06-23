import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { setupUser } from '@test-utils';
import { ItineraryDayNavigator } from '@/features/itinerary/components/ItineraryDayNavigator';
import { formatDayHeading } from '@/features/planning/planning-format';

const range = { startDayKey: '2026-06-01', endDayKey: '2026-06-03' };

function getNav() {
  return within(screen.getByLabelText('Itinerary day'));
}

describe('ItineraryDayNavigator', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the selected day and disables prev at range start', () => {
    render(
      <ItineraryDayNavigator
        range={range}
        selectedDayKey="2026-06-01"
        onDayKeyChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Itinerary day')).toBeInTheDocument();
    expect(screen.getByText(formatDayHeading('2026-06-01'))).toBeInTheDocument();
    expect(getNav().getByRole('button', { name: 'Previous day' })).toBeDisabled();
    expect(getNav().getByRole('button', { name: 'Next day' })).toBeEnabled();
  });

  it('calls onDayKeyChange when next is clicked', async () => {
    const user = setupUser();
    const onDayKeyChange = vi.fn();

    render(
      <ItineraryDayNavigator
        range={range}
        selectedDayKey="2026-06-02"
        onDayKeyChange={onDayKeyChange}
      />
    );

    await user.click(getNav().getByRole('button', { name: 'Next day' }));
    expect(onDayKeyChange).toHaveBeenCalledWith('2026-06-03');
  });

  it('disables next at range end', () => {
    render(
      <ItineraryDayNavigator
        range={range}
        selectedDayKey="2026-06-03"
        onDayKeyChange={vi.fn()}
      />
    );

    expect(getNav().getByRole('button', { name: 'Next day' })).toBeDisabled();
    expect(getNav().getByRole('button', { name: 'Previous day' })).toBeEnabled();
  });
});
