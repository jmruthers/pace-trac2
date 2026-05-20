import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ShellHomePage } from '@/app/pages/ShellHomePage';

describe('ShellHomePage', () => {
  afterEach(cleanup);

  it('renders SLICE-01 placeholder copy', () => {
    render(<ShellHomePage />);
    expect(screen.getByText('TRAC')).toBeInTheDocument();
    expect(screen.getByText(/platform shell is ready/i)).toBeInTheDocument();
  });
});
