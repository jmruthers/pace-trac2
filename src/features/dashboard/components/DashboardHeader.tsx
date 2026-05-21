import { FileDisplay } from '@solvera/pace-core/components';
import { useSecureSupabase } from '@solvera/pace-core/rbac';
import type { SupabaseClientLike } from '@solvera/pace-core/utils';
import type { DashboardEventHeader } from '@/features/dashboard/types';

interface DashboardHeaderProps {
  header: DashboardEventHeader;
}

export function DashboardHeader({ header }: DashboardHeaderProps) {
  const secureSupabase = useSecureSupabase() as unknown as SupabaseClientLike | null;
  const metadata = header.logoFileReference?.file_metadata;
  const bucket =
    metadata != null && typeof metadata.bucket === 'string' ? metadata.bucket : 'files';

  return (
    <header className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
      {header.logoFileReference != null ? (
        <FileDisplay
          fileReference={header.logoFileReference}
          supabase={secureSupabase}
          bucket={bucket}
          variant="inline"
          label={`${header.title} logo`}
        />
      ) : null}
      <section>
        <h1>{header.title}</h1>
        {header.tagline != null ? <p>{header.tagline}</p> : null}
      </section>
    </header>
  );
}
