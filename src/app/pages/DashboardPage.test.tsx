import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardPage } from '@/app/pages/DashboardPage';

vi.mock('@solvera/pace-core/rbac', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@solvera/pace-core/rbac')>();
  return {
    ...actual,
    PagePermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    usePageCan: () => ({ can: true, isLoading: false }),
    useSecureSupabase: () => null,
    useResolvedScope: () => ({
      eventId: 'evt-1',
      organisationId: 'org-1',
      isLoading: false,
    }),
  };
});

vi.mock('@/features/dashboard/DashboardContent', () => ({
  DashboardContent: () => <p>Dashboard content mock</p>,
}));

describe('DashboardPage', () => {
  afterEach(cleanup);

  it('renders dashboard content inside guard when permitted', () => {
    render(
      <MemoryRouter>
        <QueryClientProvider client={new QueryClient()}>
          <DashboardPage />
        </QueryClientProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard content mock')).toBeInTheDocument();
  });
});
