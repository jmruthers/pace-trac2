import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  LoadingSpinner,
} from '@solvera/pace-core/components';

interface DashboardCardProps {
  title: string;
  viewHref: string;
  viewLabel: string;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  emptyMessage?: string;
  children: ReactNode;
}

export function DashboardCard({
  title,
  viewHref,
  viewLabel,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  emptyMessage,
  children,
}: DashboardCardProps) {
  return (
    <Card>
      <CardHeader className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
        <CardTitle>{title}</CardTitle>
        <Link to={viewHref}>{viewLabel}</Link>
      </CardHeader>
      <CardContent className="grid gap-3">
        {isLoading ? (
          <output className="grid place-items-center py-6" aria-busy="true">
            <LoadingSpinner label={`Loading ${title.toLowerCase()}…`} />
          </output>
        ) : null}
        {!isLoading && isError ? (
          <Alert variant="destructive" role="alert">
            <p>{errorMessage ?? `Could not load ${title.toLowerCase()}.`}</p>
            <fieldset className="text-right">
              <Button type="button" variant="outline" onClick={onRetry}>
                Retry
              </Button>
            </fieldset>
          </Alert>
        ) : null}
        {!isLoading && !isError ? (
          <>
            {emptyMessage != null ? <p>{emptyMessage}</p> : null}
            {children}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
