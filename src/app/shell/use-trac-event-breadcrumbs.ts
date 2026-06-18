import { useMemo } from 'react';
import type { BreadcrumbItem } from '@solvera/pace-core/components';
import { useOptionalEvents } from '@solvera/pace-core/hooks';
import type { EventStub } from '@solvera/pace-core/types';
import { TRAC_AUTHENTICATED_HOME_PATH } from '@/app/routes/route-redirects';

function resolveEventBreadcrumbLabel(selectedEvent: EventStub | null | undefined): string {
  if (selectedEvent == null) return 'Event';
  const record = selectedEvent as { code?: string; name?: string };
  const code = typeof record.code === 'string' ? record.code.trim() : '';
  if (code !== '') return code;
  const name = typeof record.name === 'string' ? record.name.trim() : '';
  return name !== '' ? name : 'Event';
}

export function useTracEventBreadcrumbs(currentPageLabel: string): BreadcrumbItem[] {
  const { selectedEvent } = useOptionalEvents();

  return useMemo(() => {
    const items: BreadcrumbItem[] = [
      { label: 'Events', href: TRAC_AUTHENTICATED_HOME_PATH },
    ];
    if (selectedEvent != null) {
      items.push({
        label: resolveEventBreadcrumbLabel(selectedEvent),
        href: '/dashboard',
      });
    }
    items.push({ label: currentPageLabel });
    return items;
  }, [currentPageLabel, selectedEvent]);
}
