import { useCallback, useMemo, useState } from 'react';
import {
  Button,
  PageHeader,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@solvera/pace-core/components';
import { usePageCan } from '@solvera/pace-core/rbac';
import { useTracEventBreadcrumbs } from '@/app/shell/use-trac-event-breadcrumbs';
import { AccommodationList } from '@/features/planning/components/AccommodationList';
import { ActivityList } from '@/features/planning/components/ActivityList';
import { PlanningByDayView } from '@/features/planning/components/PlanningByDayView';
import { TransportList } from '@/features/planning/components/TransportList';
import {
  useAccommodationList,
  useActivityList,
  useTransportList,
} from '@/features/planning/hooks/useLogisticsList';
import type { LogisticsResourceKind } from '@/features/planning/types';

type PlanningViewMode = 'type' | 'day';
type PlanningTab = LogisticsResourceKind;

export function PlanningPageContent() {
  const breadcrumbItems = useTracEventBreadcrumbs('Planning');
  const { can: canCreate } = usePageCan('planning', 'create');
  const transport = useTransportList();
  const accommodation = useAccommodationList();
  const activity = useActivityList();

  const [viewMode, setViewMode] = useState<PlanningViewMode>('type');
  const [activeTab, setActiveTab] = useState<PlanningTab>('transport');
  const [createToken, setCreateToken] = useState(0);

  const handleAddItem = useCallback(() => {
    setViewMode('type');
    setCreateToken((value) => value + 1);
  }, []);

  const headerActions = useMemo(() => {
    if (!canCreate) return null;
    return (
      <Button type="button" onClick={handleAddItem}>
        Add item
      </Button>
    );
  }, [canCreate, handleAddItem]);

  return (
    <section className="grid gap-4">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Planning"
        subtitle="Manage transport, accommodation, and activities for the selected event. Location addresses are saved as point-in-time snapshots on each row."
        actions={headerActions}
      />

      <fieldset className="grid grid-flow-col auto-cols-max gap-2" aria-label="Planning view">
        <Button
          type="button"
          variant={viewMode === 'type' ? 'default' : 'outline'}
          onClick={() => setViewMode('type')}
        >
          By type
        </Button>
        <Button
          type="button"
          variant={viewMode === 'day' ? 'default' : 'outline'}
          onClick={() => setViewMode('day')}
        >
          By day
        </Button>
      </fieldset>

      {viewMode === 'day' ? (
        <PlanningByDayView />
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            if (value === 'transport' || value === 'accommodation' || value === 'activity') {
              setActiveTab(value);
            }
          }}
        >
          <TabsList>
            <TabsTrigger value="transport">
              Transport ({transport.items.length})
            </TabsTrigger>
            <TabsTrigger value="accommodation">
              Accommodation ({accommodation.items.length})
            </TabsTrigger>
            <TabsTrigger value="activity">Activity ({activity.items.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="transport">
            <TransportList
              openCreateToken={activeTab === 'transport' ? createToken : undefined}
            />
          </TabsContent>
          <TabsContent value="accommodation">
            <AccommodationList
              openCreateToken={activeTab === 'accommodation' ? createToken : undefined}
            />
          </TabsContent>
          <TabsContent value="activity">
            <ActivityList openCreateToken={activeTab === 'activity' ? createToken : undefined} />
          </TabsContent>
        </Tabs>
      )}
    </section>
  );
}
