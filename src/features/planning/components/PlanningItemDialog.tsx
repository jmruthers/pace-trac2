import { useCallback, useState } from 'react';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@solvera/pace-core/components';
import { usePageCan } from '@solvera/pace-core/rbac';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';
import { AccommodationDialogForm } from '@/features/planning/components/AccommodationDialogForm';
import { ActivityDialogForm } from '@/features/planning/components/ActivityDialogForm';
import { TransportDialogForm } from '@/features/planning/components/TransportDialogForm';
import {
  useAccommodationMutations,
  useActivityMutations,
  useTransportMutations,
} from '@/features/planning/hooks/useLogisticsMutations';
import { PLANNING_KIND_LABELS } from '@/features/planning/planning-table-rows';
import type {
  AccommodationRow,
  ActivityRow,
  LogisticsResourceKind,
  TransportRow,
} from '@/features/planning/types';

export interface PlanningItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  kind: LogisticsResourceKind;
  onCreateKindChange?: (kind: LogisticsResourceKind) => void;
  transport?: TransportRow;
  accommodation?: AccommodationRow;
  activity?: ActivityRow;
}

export function PlanningItemDialog({
  open,
  onOpenChange,
  mode,
  kind,
  onCreateKindChange,
  transport,
  accommodation,
  activity,
}: PlanningItemDialogProps) {
  const { can: canCreate } = usePageCan(TRAC_PAGE_NAMES.planning, 'create');
  const { can: canUpdate } = usePageCan(TRAC_PAGE_NAMES.planning, 'update');
  const { can: canDelete } = usePageCan(TRAC_PAGE_NAMES.planning, 'delete');
  const canSave = mode === 'create' ? canCreate : canUpdate;

  const transportMutations = useTransportMutations();
  const accommodationMutations = useAccommodationMutations();
  const activityMutations = useActivityMutations();

  const [openGeneration, setOpenGeneration] = useState(0);
  const [userCreateTab, setUserCreateTab] = useState<LogisticsResourceKind | null>(null);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        setOpenGeneration((generation) => generation + 1);
      } else {
        setUserCreateTab(null);
      }
      onOpenChange(next);
    },
    [onOpenChange]
  );

  const closeDialog = useCallback(() => handleOpenChange(false), [handleOpenChange]);

  const activeTab = mode === 'create' ? (userCreateTab ?? kind) : kind;
  const isEdit = mode === 'edit';

  const handleTabChange = useCallback(
    (value: string) => {
      if (isEdit) return;
      if (value === 'transport' || value === 'accommodation' || value === 'activity') {
        setUserCreateTab(value);
        onCreateKindChange?.(value);
      }
    },
    [isEdit, onCreateKindChange]
  );

  const formSessionKey =
    mode === 'create'
      ? `create-${openGeneration}-${activeTab}`
      : `edit-${kind}-${transport?.id ?? accommodation?.id ?? activity?.id ?? 'none'}`;

  const dialogTitle =
    mode === 'create' ? 'Add planning item' : `Edit ${PLANNING_KIND_LABELS[kind].toLowerCase()}`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-4xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {open ? (
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="transport">Transport</TabsTrigger>
                <TabsTrigger value="accommodation">Accommodation</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="transport">
                {activeTab === 'transport' ? (
                  <TransportDialogForm
                    key={formSessionKey}
                    mode={mode}
                    transport={transport}
                    canSave={canSave}
                    canDelete={canDelete}
                    onSave={async (payload) => {
                      if (mode === 'edit' && transport) {
                        await transportMutations.updateItem({ id: transport.id, ...payload });
                      } else {
                        await transportMutations.createItem(payload);
                      }
                    }}
                    onDelete={
                      mode === 'edit' && transport
                        ? (id) => transportMutations.deleteItem(id)
                        : undefined
                    }
                    onClose={closeDialog}
                  />
                ) : null}
              </TabsContent>
              <TabsContent value="accommodation">
                {activeTab === 'accommodation' ? (
                  <AccommodationDialogForm
                    key={formSessionKey}
                    mode={mode}
                    accommodation={accommodation}
                    canSave={canSave}
                    canDelete={canDelete}
                    onSave={async (payload) => {
                      if (mode === 'edit' && accommodation) {
                        await accommodationMutations.updateItem({
                          id: accommodation.id,
                          ...payload,
                        });
                      } else {
                        await accommodationMutations.createItem(payload);
                      }
                    }}
                    onDelete={
                      mode === 'edit' && accommodation
                        ? (id) => accommodationMutations.deleteItem(id)
                        : undefined
                    }
                    onClose={closeDialog}
                  />
                ) : null}
              </TabsContent>
              <TabsContent value="activity">
                {activeTab === 'activity' ? (
                  <ActivityDialogForm
                    key={formSessionKey}
                    mode={mode}
                    activity={activity}
                    canSave={canSave}
                    canDelete={canDelete}
                    onSave={async (payload) => {
                      if (mode === 'edit' && activity) {
                        await activityMutations.updateItem({ id: activity.id, ...payload });
                      } else {
                        await activityMutations.createItem(payload);
                      }
                    }}
                    onDelete={
                      mode === 'edit' && activity
                        ? (id) => activityMutations.deleteItem(id)
                        : undefined
                    }
                    onClose={closeDialog}
                  />
                ) : null}
              </TabsContent>
            </Tabs>
          ) : null}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
