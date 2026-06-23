import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { setupUser } from '@test-utils';
import { PlanningStatusPicker } from '@/features/planning/components/PlanningStatusPicker';

describe('PlanningStatusPicker', () => {
  afterEach(cleanup);

  it('calls onChange when a status badge is selected', async () => {
    const user = setupUser();
    const onChange = vi.fn();
    render(<PlanningStatusPicker value="idea" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Booked' }));
    expect(onChange).toHaveBeenCalledWith('booked');
  });
});
