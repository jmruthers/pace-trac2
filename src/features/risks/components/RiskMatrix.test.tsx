import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { RiskMatrix } from '@/features/risks/components/RiskMatrix';
import type { Risk } from '@/features/risks/types';

function renderMatrix(risks: Risk[]) {
  return render(<RiskMatrix risks={risks} />);
}

function buildRisk(
  overrides: Partial<Risk> & Pick<Risk, 'likelihood_after' | 'consequence_after'>
): Risk {
  return {
    id: 'risk-1',
    event_id: 'event-1',
    organisation_id: 'org-1',
    type: 'Operational',
    risk: 'Sample risk',
    likelihood_before: 'Possible',
    consequence_before: 'Minor',
    control: null,
    responsible_contact_id: null,
    when: 'Prior',
    status: 'Planned',
    comment: null,
    response: null,
    impact_before: 6,
    impact_after: 2,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    created_by: null,
    updated_by: null,
    ...overrides,
  };
}

function matrixTable() {
  return within(screen.getByTestId('risk-matrix')).getByRole('table');
}

function matrixRow(matrix: HTMLElement, likelihood: string) {
  const escaped = likelihood.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return within(matrix).getByRole('row', { name: new RegExp(`\\b${escaped}\\b`) });
}

describe('RiskMatrix', () => {
  afterEach(cleanup);

  it('renders corner axis label and residual footnote', () => {
    renderMatrix([]);

    expect(screen.getByText('L ↓ / C →')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Each cell shows how many risks sit at that residual (after-control) position — likelihood rank × consequence rank.'
      )
    ).toBeInTheDocument();
  });

  it('renders axis headers with ranks', () => {
    renderMatrix([]);

    const matrix = matrixTable();
    expect(within(matrix).getByRole('columnheader', { name: /Insignificant/i })).toHaveTextContent('(1)');
    expect(within(matrix).getByRole('columnheader', { name: /Severe/i })).toHaveTextContent('(5)');
  });

  it('orders likelihood rows high to low', () => {
    renderMatrix([]);

    const matrix = matrixTable();
    const rowHeaders = within(matrix).getAllByRole('rowheader');
    expect(rowHeaders[0]).toHaveTextContent('Almost certain');
    expect(rowHeaders[rowHeaders.length - 1]).toHaveTextContent('Rare');
  });

  it('shows counts in matching cells and em dash for empty cells', () => {
    const risks = [
      buildRisk({ id: 'a', likelihood_after: 'Likely', consequence_after: 'Major' }),
      buildRisk({ id: 'b', likelihood_after: 'Likely', consequence_after: 'Major' }),
    ];

    renderMatrix(risks);

    const matrix = matrixTable();
    const likelyRow = matrixRow(matrix, 'Likely');
    expect(within(likelyRow).getByRole('cell', { name: '2' })).toBeInTheDocument();
    const rareRow = matrixRow(matrix, 'Rare');
    const rareCells = within(rareRow).getAllByRole('cell');
    expect(rareCells[0]).toHaveTextContent('—');
  });

  it('applies impact band styling on non-empty cells', () => {
    const risks = [buildRisk({ likelihood_after: 'Almost certain', consequence_after: 'Severe' })];

    renderMatrix(risks);

    const matrix = matrixTable();
    const row = matrixRow(matrix, 'Almost certain');
    const cell = within(row).getByRole('cell', { name: '1' });
    expect(cell.className).toContain('bg-acc-700');
  });

  it('renders a semantic table for the matrix grid', () => {
    renderMatrix([]);

    const matrix = matrixTable();
    expect(matrix).toBeInTheDocument();
    expect(within(matrix).getByRole('columnheader', { name: /L ↓ \/ C →/ })).toBeInTheDocument();
  });
});
