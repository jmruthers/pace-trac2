import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Alert,
  Button,
  DataTable,
  type DataTableAction,
  type DataTableColumn,
} from '@solvera/pace-core/components';
import { SquarePen } from '@solvera/pace-core/icons';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';
import { PlanningItemDialog } from '@/features/planning/components/PlanningItemDialog';
import { PlanningStatusBadge } from '@/features/planning/components/PlanningStatusBadge';
import {
  useAccommodationMutations,
  useActivityMutations,
  useTransportMutations,
} from '@/features/planning/hooks/useLogisticsMutations';
import {
  usePlanningTableRows,
  type PlanningKindFilter,
  type PlanningTableRow,
} from '@/features/planning/hooks/usePlanningTableRows';
import { formatWhen } from '@/features/planning/planning-format';
import {
  PLANNING_INITIAL_GROUPING,
  PLANNING_TABLE_FEATURES,
  PLANNING_TABLE_PAGE_SIZE,
} from '@/features/planning/planning-table-config';
import { PLANNING_KIND_LABELS } from '@/features/planning/planning-table-rows';
import type {
  AccommodationRow,
  ActivityRow,
  LogisticsResourceKind,
  TransportRow,
} from '@/features/planning/types';

const KIND_FILTERS: PlanningKindFilter[] = [
  'all',
  'transport',
  'accommodation',
  'activity',
];

function isPlanningKindFilter(value: string | null): value is PlanningKindFilter {
  return value != null && KIND_FILTERS.includes(value as PlanningKindFilter);
}

function sourceRowForKind(row: PlanningTableRow): {
  transport?: TransportRow;
  accommodation?: AccommodationRow;
  activity?: ActivityRow;
} {
  if (row.kind === 'transport') return { transport: row.sourceRow as TransportRow };
  if (row.kind === 'accommodation') return { accommodation: row.sourceRow as AccommodationRow };
  return { activity: row.sourceRow as ActivityRow };
}

export function PlanningTable() {
  const [searchParams, setSearchParams] = useSearchParams();
  const kindParam = searchParams.get('kind');
  const resourceIdParam = searchParams.get('resourceId');
  const editParam = searchParams.get('edit');

  const urlKindFilter = isPlanningKindFilter(kindParam) ? kindParam : null;
  const [localKindFilter, setLocalKindFilter] = useState<PlanningKindFilter>(
    urlKindFilter ?? 'all'
  );
  const kindFilter = urlKindFilter ?? localKindFilter;
  const { rows, kindCounts, isLoading, isError, error } = usePlanningTableRows(kindFilter);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [dialogKind, setDialogKind] = useState<LogisticsResourceKind>('transport');
  const [selectedRow, setSelectedRow] = useState<PlanningTableRow | null>(null);

  const transportMutations = useTransportMutations();
  const accommodationMutations = useAccommodationMutations();
  const activityMutations = useActivityMutations();

  const openCreate = useCallback(() => {
    setSelectedRow(null);
    setDialogMode('create');
    setDialogKind('transport');
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((row: PlanningTableRow) => {
    setSelectedRow(row);
    setDialogMode('edit');
    setDialogKind(row.kind);
    setDialogOpen(true);
  }, []);

  const clearDeepLinkParams = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('kind');
        next.delete('resourceId');
        next.delete('edit');
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  const [consumedDeepLinkKey, setConsumedDeepLinkKey] = useState<string | null>(null);

  const deepLinkKey =
    editParam === '1' && resourceIdParam != null ? `${resourceIdParam}:${editParam}` : null;
  const deepLinkRow =
    deepLinkKey != null && !isLoading && consumedDeepLinkKey !== deepLinkKey
      ? (rows.find((row) => row.id === resourceIdParam) ?? null)
      : null;
  const isDeepLinkDialogOpen = deepLinkRow != null;

  const effectiveDialogOpen = dialogOpen || isDeepLinkDialogOpen;
  const effectiveDialogMode = isDeepLinkDialogOpen ? 'edit' : dialogMode;
  const effectiveSelectedRow = isDeepLinkDialogOpen ? deepLinkRow : selectedRow;
  const effectiveDialogKind = effectiveSelectedRow?.kind ?? dialogKind;

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      setDialogOpen(open);
      if (!open && deepLinkKey != null) {
        setConsumedDeepLinkKey(deepLinkKey);
        clearDeepLinkParams();
      }
    },
    [clearDeepLinkParams, deepLinkKey]
  );

  const handleDeleteRow = useCallback(
    async (row: PlanningTableRow) => {
      if (row.kind === 'transport') {
        await transportMutations.deleteItem(row.id);
        return;
      }
      if (row.kind === 'accommodation') {
        await accommodationMutations.deleteItem(row.id);
        return;
      }
      await activityMutations.deleteItem(row.id);
    },
    [transportMutations, accommodationMutations, activityMutations]
  );

  const columns = useMemo(
    (): DataTableColumn<PlanningTableRow>[] => [
      {
        id: 'startDayKey',
        accessorKey: 'startDayKey',
        header: 'Date',
        enableGrouping: true,
        sortable: true,
        cell: ({ row }) => row.startDayLabel,
      },
      {
        id: 'kind',
        accessorKey: 'kind',
        header: 'Type',
        sortable: true,
        searchable: true,
        cell: ({ row }) => PLANNING_KIND_LABELS[row.kind],
      },
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
        sortable: true,
        searchable: true,
      },
      {
        id: 'startTime',
        accessorKey: 'startTime',
        header: 'Start',
        sortable: true,
        cell: ({ row }) => formatWhen(row.startTime),
      },
      {
        id: 'endTime',
        accessorKey: 'endTime',
        header: 'End',
        sortable: true,
        cell: ({ row }) => (row.endTime != null ? formatWhen(row.endTime) : '—'),
      },
      {
        id: 'locationSummary',
        accessorKey: 'locationSummary',
        header: 'Location',
        searchable: true,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        sortable: true,
        cell: ({ row }) => <PlanningStatusBadge status={row.status} />,
      },
    ],
    []
  );

  const rowActions = useMemo(
    (): DataTableAction<PlanningTableRow>[] => [
      {
        label: 'Edit',
        icon: SquarePen,
        variant: 'outline',
        onClick: (row) => openEdit(row),
      },
    ],
    [openEdit]
  );

  const dialogSource = effectiveSelectedRow ? sourceRowForKind(effectiveSelectedRow) : {};

  return (
    <section className="grid gap-4">
      {isError ? (
        <Alert variant="destructive">
          {error instanceof Error ? error.message : 'Failed to load planning items'}
        </Alert>
      ) : null}

      <fieldset className="grid grid-flow-col auto-cols-max gap-2" aria-label="Planning type filter">
        {KIND_FILTERS.map((filter) => {
          const label =
            filter === 'all' ? 'All' : PLANNING_KIND_LABELS[filter as LogisticsResourceKind];
          return (
            <Button
              key={filter}
              type="button"
              variant={kindFilter === filter ? 'default' : 'outline'}
              onClick={() => {
                setLocalKindFilter(filter);
                if (urlKindFilter != null) {
                  clearDeepLinkParams();
                }
              }}
            >
              {label} ({kindCounts[filter]})
            </Button>
          );
        })}
      </fieldset>

      <DataTable
        data={rows}
        columns={columns}
        rbac={{ pageName: TRAC_PAGE_NAMES.planning }}
        features={PLANNING_TABLE_FEATURES}
        initialGroupingColumnId={PLANNING_INITIAL_GROUPING}
        initialPageSize={PLANNING_TABLE_PAGE_SIZE}
        actions={rowActions}
        onCreateClick={openCreate}
        onDeleteRow={handleDeleteRow}
        isLoading={isLoading}
        getRowId={(row) => `${(row as PlanningTableRow).kind}:${(row as PlanningTableRow).id}`}
        rowNoun="item"
        emptyState={{
          title: 'No planning items yet',
          description: 'Create transport, accommodation, or activity rows for this event.',
        }}
      />

      <PlanningItemDialog
        open={effectiveDialogOpen}
        onOpenChange={handleDialogOpenChange}
        mode={effectiveDialogMode}
        kind={effectiveDialogKind}
        onCreateKindChange={setDialogKind}
        transport={dialogSource.transport}
        accommodation={dialogSource.accommodation}
        activity={dialogSource.activity}
      />
    </section>
  );
}
