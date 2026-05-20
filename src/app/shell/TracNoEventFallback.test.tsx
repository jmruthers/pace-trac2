import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TracNoEventFallback } from '@/app/shell/TracNoEventFallback';

describe('TracNoEventFallback', () => {
  afterEach(cleanup);

  it('renders shared no-event guidance and home link', () => {
    render(
      <MemoryRouter>
        <TracNoEventFallback />
      </MemoryRouter>
    );

    expect(screen.getByText('Select an event')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /return to home/i })).toHaveAttribute('href', '/');
  });
});
