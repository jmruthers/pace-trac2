import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { setupUser } from '@test-utils';
import { TransportModeIconPicker } from '@/features/planning/components/TransportModeIconPicker';

describe('TransportModeIconPicker', () => {
  afterEach(cleanup);

  it('selects mode and sets aria-pressed on active option', async () => {
    const user = setupUser();
    const onChange = vi.fn();
    render(<TransportModeIconPicker value="Flight" onChange={onChange} />);

    const trainButton = screen.getByRole('button', { name: 'Train' });
    expect(screen.getByRole('button', { name: 'Flight' })).toHaveAttribute('aria-pressed', 'true');
    expect(trainButton).toHaveAttribute('aria-pressed', 'false');

    await user.click(trainButton);
    expect(onChange).toHaveBeenCalledWith('Train');
  });
});
