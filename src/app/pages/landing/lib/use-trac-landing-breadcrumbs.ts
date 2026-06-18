import { useMemo } from 'react';
import type { BreadcrumbItem } from '@solvera/pace-core/components';

export function useTracLandingBreadcrumbs(): BreadcrumbItem[] {
  return useMemo(
    () => [
      { label: 'pace-trac', href: '/' },
      { label: 'Events' },
    ],
    []
  );
}
