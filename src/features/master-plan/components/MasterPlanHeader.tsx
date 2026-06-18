import { FileDisplay } from '@solvera/pace-core/components';
import { useFileDisplay } from '@solvera/pace-core/hooks';
import { useSecureSupabase } from '@solvera/pace-core/rbac';
import type { MasterPlanEventHeader } from '@/features/master-plan/hooks/useMasterPlanEventHeader';

interface MasterPlanHeaderProps {
  header: MasterPlanEventHeader;
  eventCode: string;
  baseCurrency: string | null;
}

export function MasterPlanHeader({ header, eventCode, baseCurrency }: MasterPlanHeaderProps) {
  const secureSupabase = useSecureSupabase();
  const { url: logoUrl } = useFileDisplay(header.logoFileReference, {
    client: secureSupabase as unknown as NonNullable<
      Parameters<typeof useFileDisplay>[1]
    >['client'],
  });

  const codeLabel = eventCode !== '' ? eventCode : 'Event';

  return (
    <header className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
      {header.logoFileReference != null ? (
        <FileDisplay
          fileReference={header.logoFileReference}
          url={logoUrl}
          supabase={
            secureSupabase as unknown as NonNullable<
              Parameters<typeof FileDisplay>[0]['supabase']
            >
          }
          variant="inline"
          label={`${header.eventName} logo`}
        />
      ) : null}
      <article className="grid gap-2">
        <p>Master plan · {codeLabel}</p>
        <h1>{header.eventName}</h1>
        <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <article>
            <h2>Dates</h2>
            <p>{header.dateRangeLabel}</p>
          </article>
          <article>
            <h2>Base currency</h2>
            <p>{baseCurrency ?? '—'}</p>
          </article>
        </section>
      </article>
    </header>
  );
}
