import type { ReactNode } from 'react';
import { Alert, LoadingSpinner } from '@solvera/pace-core/components';

interface MasterPlanSectionShellProps {
  title: string;
  countLabel?: string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string | null;
  children: ReactNode;
  className?: string;
}

export function MasterPlanSectionShell({
  title,
  countLabel,
  isLoading = false,
  isError = false,
  errorMessage,
  children,
  className,
}: MasterPlanSectionShellProps) {
  return (
    <section className={className ?? 'grid gap-4 break-after-page'}>
      <header className="grid grid-cols-[1fr_auto] items-baseline gap-2">
        <h2>{title}</h2>
        {countLabel != null ? <small>{countLabel}</small> : null}
      </header>
      {isLoading ? (
        <section className="grid min-h-[8rem] place-items-center" aria-busy="true">
          <LoadingSpinner label={`Loading ${title.toLowerCase()}…`} />
        </section>
      ) : isError ? (
        <Alert variant="destructive" role="alert">
          <p>{errorMessage ?? `Could not load ${title.toLowerCase()}.`}</p>
        </Alert>
      ) : (
        children
      )}
    </section>
  );
}
