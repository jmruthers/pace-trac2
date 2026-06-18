import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  DataTable,
  PageHeader,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type DataTableColumn,
} from '@solvera/pace-core/components';
import { usePaceMain } from '@solvera/pace-core/hooks';
import { usePageCan } from '@solvera/pace-core/rbac';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';
import { useTracEventBreadcrumbs } from '@/app/shell/use-trac-event-breadcrumbs';
import { RiskDialog } from '@/features/risks/components/RiskDialog';
import { RiskMatrix } from '@/features/risks/components/RiskMatrix';
import { RisksRegisterCard } from '@/features/risks/components/RisksRegisterCard';
import { formatRiskImpact } from '@/features/risks/format-risk-impact';
import { useRisks } from '@/features/risks/hooks/use-risks';
import { RISK_STATUS_LABELS, RISK_STATUS_VALUES } from '@/features/risks/enums/risk-status';
import { RISK_TYPE_LABELS } from '@/features/risks/enums/risk-type';
import { RISK_WHEN_LABELS } from '@/features/risks/enums/risk-when';
import type { Risk } from '@/features/risks/types';
import type { RiskStatus } from '@/features/risks/enums/risk-status';

type StatusFilter = 'all' | RiskStatus;

export function RisksContent() {
  usePaceMain({
    printTitle: 'Risk Register',
    printPageOrientation: 'landscape',
  });

  const breadcrumbItems = useTracEventBreadcrumbs('Risks');
  const { can: canCreate } = usePageCan(TRAC_PAGE_NAMES.risks, 'create');
  const { risks, isLoading, error, addRisk, updateRisk, deleteRisk, isSaving } = useRisks();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const openCreate = useCallback(() => {
    setSelectedRisk(null);
    setDialogMode('create');
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((risk: Risk) => {
    setSelectedRisk(risk);
    setDialogMode('edit');
    setDialogOpen(true);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleSave = useCallback(
    async (formData: Parameters<typeof addRisk>[0]) => {
      if (dialogMode === 'create') {
        await addRisk(formData);
      } else if (selectedRisk != null) {
        await updateRisk(selectedRisk.id, formData);
      }
    },
    [addRisk, updateRisk, dialogMode, selectedRisk]
  );

  const handleDeleteRow = useCallback(
    async (row: Risk) => {
      await deleteRisk(row.id);
    },
    [deleteRisk]
  );

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: risks.length,
      Planned: 0,
      'In progress': 0,
      Complete: 0,
    };
    for (const risk of risks) {
      counts[risk.status] += 1;
    }
    return counts;
  }, [risks]);

  const filteredRisks = useMemo(() => {
    if (statusFilter === 'all') return risks;
    return risks.filter((risk) => risk.status === statusFilter);
  }, [risks, statusFilter]);

  const columns: DataTableColumn<Risk>[] = useMemo(
    () => [
      {
        accessorKey: 'type',
        header: 'Type',
        sortable: true,
        searchable: true,
        cell: ({ getValue }) => {
          const value = getValue() as Risk['type'];
          return RISK_TYPE_LABELS[value] ?? String(value);
        },
      },
      {
        accessorKey: 'risk',
        header: 'Risk',
        sortable: true,
        searchable: true,
        fieldType: 'text',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        sortable: true,
        cell: ({ getValue }) => {
          const value = getValue() as Risk['status'];
          return RISK_STATUS_LABELS[value] ?? String(value);
        },
      },
      {
        accessorKey: 'when',
        header: 'When',
        sortable: true,
        cell: ({ getValue }) => {
          const value = getValue() as Risk['when'];
          return RISK_WHEN_LABELS[value] ?? String(value);
        },
      },
      {
        accessorKey: 'impact_before',
        header: 'Impact (before)',
        sortable: true,
        cell: ({ row }) => formatRiskImpact(row).before,
      },
      {
        accessorKey: 'impact_after',
        header: 'Impact (after)',
        sortable: true,
        cell: ({ row }) => formatRiskImpact(row).after,
      },
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        label: 'Edit',
        onClick: (row: Risk) => openEdit(row),
      },
    ],
    [openEdit]
  );

  const headerActions = (
    <fieldset aria-label="Risk register actions" className="grid grid-flow-col auto-cols-max gap-2 print:hidden">
      {canCreate ? (
        <Button type="button" onClick={openCreate}>
          Add risk
        </Button>
      ) : null}
      <Button type="button" variant="outline" onClick={handlePrint}>
        Print
      </Button>
    </fieldset>
  );

  return (
    <main className="grid gap-4">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Risks"
        subtitle="Maintain the event risk register. Likelihood and consequence drive generated impact scores (read-only after save)."
        actions={headerActions}
      />
      {error != null ? (
        <Alert variant="destructive" role="alert">
          <p>{error}</p>
        </Alert>
      ) : null}
      {!isLoading && error == null && risks.length === 0 ? (
        <p>No risks yet for this event. Use Add risk to create one.</p>
      ) : null}

      <RiskMatrix risks={risks} />

      <Tabs
        value={statusFilter}
        onValueChange={(value) => {
          if (value === 'all' || RISK_STATUS_VALUES.includes(value as RiskStatus)) {
            setStatusFilter(value as StatusFilter);
          }
        }}
      >
        <TabsList>
          <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
          {RISK_STATUS_VALUES.map((status) => (
            <TabsTrigger key={status} value={status}>
              {RISK_STATUS_LABELS[status]} ({statusCounts[status]})
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={statusFilter}>
          <RisksRegisterCard>
            <DataTable
              data={filteredRisks}
              columns={columns}
              rbac={{ pageName: TRAC_PAGE_NAMES.risks }}
              features={{
                search: true,
                pagination: true,
                sorting: true,
                deletion: true,
                creation: false,
                editing: false,
              }}
              actions={rowActions}
              onDeleteRow={handleDeleteRow}
              isLoading={isLoading}
              getRowId={(row) => String((row as Risk).id)}
            />
          </RisksRegisterCard>
        </TabsContent>
      </Tabs>

      <RiskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        risk={selectedRisk}
        mode={dialogMode}
        onSave={handleSave}
        onDelete={dialogMode === 'edit' ? deleteRisk : undefined}
        isSubmitting={isSaving}
      />
    </main>
  );
}
