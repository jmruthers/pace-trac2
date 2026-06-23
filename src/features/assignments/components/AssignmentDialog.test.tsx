import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupUser } from '@test-utils';
import { AssignmentDialog } from '@/features/assignments/components/AssignmentDialog';
import type { AssignmentWithParticipant } from '@/features/assignments/types';

const mockDeleteAssignment = vi.fn();
const mockUseApprovedApplications = vi.fn();
const mockUseAssignmentMutations = vi.fn();

vi.mock('@/features/assignments/hooks/useApprovedApplications', () => ({
  useApprovedApplications: () => mockUseApprovedApplications(),
}));

vi.mock('@/features/assignments/hooks/useAssignmentMutations', () => ({
  useAssignmentMutations: () => mockUseAssignmentMutations(),
}));

const assignment: AssignmentWithParticipant = {
  id: 'assign-1',
  application_id: 'app-1',
  resource_type: 'activity',
  resource_id: 'activity-1',
  event_id: 'event-1',
  organisation_id: 'org-1',
  notes: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  created_by: null,
  updated_by: null,
  participantLabel: 'Jamie Lee',
};

const resource = {
  id: 'activity-1',
  kind: 'activity' as const,
  label: 'Summit hike',
  capacity: 10,
};

function renderDialog(overrides: Partial<Parameters<typeof AssignmentDialog>[0]> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AssignmentDialog
        open
        onOpenChange={vi.fn()}
        mode="edit"
        resourceType="activity"
        resource={resource}
        assignment={assignment}
        assignedCount={1}
        assignedApplicationIds={new Set()}
        onSaved={vi.fn()}
        {...overrides}
      />
    </QueryClientProvider>
  );
}

describe('AssignmentDialog delete confirmation', () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseApprovedApplications.mockReturnValue({
      applications: [],
      isLoading: false,
    });
    mockDeleteAssignment.mockResolvedValue(undefined);
    mockUseAssignmentMutations.mockReturnValue({
      createAssignment: vi.fn(),
      updateAssignmentNotes: vi.fn(),
      deleteAssignment: mockDeleteAssignment,
      isSaving: false,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    });
  });

  it('opens confirmation dialog when Delete is clicked', async () => {
    const user = setupUser();
    renderDialog();

    const editDialog = screen.getByRole('dialog', { name: /edit assignment/i });
    await user.click(within(editDialog).getByRole('button', { name: /^delete$/i }));

    expect(screen.getByRole('heading', { name: 'Delete assignment' })).toBeInTheDocument();
    expect(
      screen.getByText(/remove jamie lee from summit hike\? this cannot be undone/i)
    ).toBeInTheDocument();
    expect(mockDeleteAssignment).not.toHaveBeenCalled();
  });

  it('calls deleteAssignment when delete is confirmed', async () => {
    const user = setupUser();
    const onSaved = vi.fn();
    const onOpenChange = vi.fn();
    renderDialog({ onSaved, onOpenChange });

    const editDialog = screen.getByRole('dialog', { name: /edit assignment/i });
    await user.click(within(editDialog).getByRole('button', { name: /^delete$/i }));

    const confirmDialog = screen.getByRole('dialog', { name: 'Delete assignment' });
    await user.click(within(confirmDialog).getByRole('button', { name: /^delete$/i }));

    expect(mockDeleteAssignment).toHaveBeenCalledWith('assign-1');
    expect(onSaved).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not delete when confirmation is cancelled', async () => {
    const user = setupUser();
    renderDialog();

    const editDialog = screen.getByRole('dialog', { name: /edit assignment/i });
    await user.click(within(editDialog).getByRole('button', { name: /^delete$/i }));

    const confirmDialog = screen.getByRole('dialog', { name: 'Delete assignment' });
    await user.click(within(confirmDialog).getByRole('button', { name: /^cancel$/i }));

    expect(mockDeleteAssignment).not.toHaveBeenCalled();
  });
});
