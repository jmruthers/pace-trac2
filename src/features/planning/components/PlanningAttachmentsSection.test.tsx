import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupUser } from '@test-utils';
import { PlanningAttachmentsSection } from '@/features/planning/components/PlanningAttachmentsSection';
import type { PlanningAttachment } from '@/features/planning/types';

const mockRemoveAttachment = vi.fn();
const mockUsePlanningAttachments = vi.fn();
const mockUsePlanningScope = vi.fn();
const mockUseSecureSupabase = vi.fn();

vi.mock('@/features/planning/hooks/usePlanningAttachments', () => ({
  usePlanningAttachments: () => mockUsePlanningAttachments(),
}));

vi.mock('@/features/planning/hooks/usePlanningScope', () => ({
  usePlanningScope: () => mockUsePlanningScope(),
}));

vi.mock('@solvera/pace-core/rbac', () => ({
  useSecureSupabase: () => mockUseSecureSupabase(),
}));

vi.mock('@solvera/pace-core/components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@solvera/pace-core/components')>();
  return {
    ...actual,
    FileUpload: () => null,
  };
});

function clickAttachmentDelete(user: ReturnType<typeof setupUser>) {
  const listItem = screen.getByText('ticket.pdf').closest('li');
  if (listItem == null) {
    throw new Error('Expected attachment list item');
  }
  return user.click(within(listItem).getByRole('button', { name: /^delete$/i }));
}

const sampleAttachment: PlanningAttachment = {
  id: 'file-1',
  record_id: 'transport-1',
  table_name: 'trac_transport',
  file_path: 'org-1/trac_transport/ticket.pdf',
  file_name: 'ticket.pdf',
  file_type: 'application/pdf',
  file_size: 1024,
  created_at: '2026-01-01T00:00:00Z',
};

function renderSection() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <PlanningAttachmentsSection
        tableName="trac_transport"
        recordId="transport-1"
        canWrite
      />
    </QueryClientProvider>
  );
}

describe('PlanningAttachmentsSection delete confirmation', () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePlanningScope.mockReturnValue({
      eventId: 'event-1',
      organisationId: 'org-1',
      appId: 'app-1',
    });
    mockUseSecureSupabase.mockReturnValue({});
    mockRemoveAttachment.mockResolvedValue(undefined);
    mockUsePlanningAttachments.mockReturnValue({
      attachments: [sampleAttachment],
      isLoading: false,
      removeAttachment: mockRemoveAttachment,
      isDeleting: false,
      uploadError: null,
      deleteError: null,
      refetch: vi.fn(),
    });
  });

  it('opens confirmation dialog when Delete is clicked', async () => {
    const user = setupUser();
    renderSection();

    await clickAttachmentDelete(user);

    expect(screen.getByRole('heading', { name: 'Delete document' })).toBeInTheDocument();
    expect(
      screen.getByText(/permanently remove ticket\.pdf from this planning item/i)
    ).toBeInTheDocument();
    expect(mockRemoveAttachment).not.toHaveBeenCalled();
  });

  it('calls removeAttachment when delete is confirmed', async () => {
    const user = setupUser();
    renderSection();

    await clickAttachmentDelete(user);

    const confirmDialog = screen.getByRole('dialog', { name: 'Delete document' });
    await user.click(within(confirmDialog).getByRole('button', { name: /^delete$/i }));

    expect(mockRemoveAttachment).toHaveBeenCalledWith(sampleAttachment);
  });

  it('does not delete when confirmation is cancelled', async () => {
    const user = setupUser();
    renderSection();

    await clickAttachmentDelete(user);

    const confirmDialog = screen.getByRole('dialog', { name: 'Delete document' });
    await user.click(within(confirmDialog).getByRole('button', { name: /^cancel$/i }));

    expect(mockRemoveAttachment).not.toHaveBeenCalled();
  });
});
