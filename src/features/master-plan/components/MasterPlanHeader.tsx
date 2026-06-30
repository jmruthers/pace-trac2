import { HeroLogo } from '@solvera/pace-core/components';
import { useFileDisplay } from '@solvera/pace-core/hooks';
import { useSecureSupabase } from '@solvera/pace-core/rbac';
import type { SupabaseClientLike } from '@solvera/pace-core/utils';
import { eventNameFallback } from '@/app/pages/landing/lib/event-tile-helpers';
import type { MasterPlanEventHeader } from '@/features/master-plan/hooks/useMasterPlanEventHeader';

interface MasterPlanHeaderProps {
  header: MasterPlanEventHeader;
}

export function MasterPlanHeader({ header }: MasterPlanHeaderProps) {
  const secureSupabase = useSecureSupabase() as unknown as SupabaseClientLike | null;
  const { url: logoUrl } = useFileDisplay(header.logoFileReference, {
    client: secureSupabase as unknown as NonNullable<
      Parameters<typeof useFileDisplay>[1]
    >['client'],
  });

  return (
    <header className="grid gap-4 rounded-2xl border border-sec-200 p-6">
      <section className="grid gap-4 lg:grid-cols-[auto_1fr] lg:items-start">
        <HeroLogo
          alt={`${header.title} logo`}
          code={eventNameFallback(header.title)}
          image={logoUrl ?? undefined}
        />
        <article className="grid gap-2">
          <small>Master plan · {header.eventCode}</small>
          <h1>{header.title}</h1>
          {header.tagline != null ? <p>{header.tagline}</p> : null}
        </article>
      </section>
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt>Dates</dt>
          <dd>{header.dateRangeLabel}</dd>
        </div>
        <div>
          <dt>Organisation</dt>
          <dd>{header.organisationName ?? '—'}</dd>
        </div>
        <div>
          <dt>Participants</dt>
          <dd>{header.approvedParticipantCount}</dd>
        </div>
        <div>
          <dt>Base currency</dt>
          <dd>{header.baseCurrency ?? '—'}</dd>
        </div>
      </dl>
    </header>
  );
}
