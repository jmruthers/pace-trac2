import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MasterPlanPage } from '@/app/pages/MasterPlanPage';

vi.mock('@solvera/pace-core/rbac', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@solvera/pace-core/rbac')>();
  return {
    ...actual,
    PagePermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock('@/features/master-plan/MasterPlanContent', () => ({
  MasterPlanContent: () => <h1>Master plan content</h1>,
}));

describe('MasterPlanPage', () => {
  it('renders master plan content inside main', () => {
    render(<MasterPlanPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Master plan content' })).toBeInTheDocument();
  });
});
