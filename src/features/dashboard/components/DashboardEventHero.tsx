import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  EntityHero,
  HeroLogo,
  PageHeader,
} from '@solvera/pace-core/components';
import { useFileDisplay, useOptionalEvents } from '@solvera/pace-core/hooks';
import { Calendar, Building2, MapPin } from '@solvera/pace-core/icons';
import { useSecureSupabase } from '@solvera/pace-core/rbac';
import type { SupabaseClientLike } from '@solvera/pace-core/utils';
import {
  eventNameFallback,
  formatEventDateSpan,
  readEventDate,
  readEventDays,
  readEventLogoUrl,
  readEventVenue,
  readExpectedParticipants,
} from '@/app/pages/landing/lib/event-tile-helpers';
import { TRAC_AUTHENTICATED_HOME_PATH } from '@/app/routes/route-redirects';
import type { DashboardEventHeader } from '@/features/dashboard/types';

const DASHBOARD_SUBTITLE =
  'Trip logistics for transport, accommodation, activities, itinerary, costs, and risks.';

interface DashboardEventHeroProps {
  header: DashboardEventHeader;
}

export function DashboardEventHero({ header }: DashboardEventHeroProps) {
  const navigate = useNavigate();
  const { selectedEvent } = useOptionalEvents();
  const secureSupabase = useSecureSupabase() as unknown as SupabaseClientLike | null;
  const { url: fileLogoUrl } = useFileDisplay(header.logoFileReference, {
    client: secureSupabase as unknown as NonNullable<
      Parameters<typeof useFileDisplay>[1]
    >['client'],
  });

  const eventName = header.title;
  const stubLogoUrl = readEventLogoUrl(selectedEvent);
  const logoUrl = fileLogoUrl ?? stubLogoUrl;
  const eventDate = readEventDate(selectedEvent);
  const eventDays = readEventDays(selectedEvent);
  const venue = readEventVenue(selectedEvent);
  const participants = readExpectedParticipants(selectedEvent);

  const breadcrumbItems = useMemo(
    () => [
      { label: 'Events', href: TRAC_AUTHENTICATED_HOME_PATH },
      { label: eventName },
    ],
    [eventName]
  );

  const meta = [
    {
      icon: <Calendar className="size-4 text-main-600" aria-hidden />,
      text: formatEventDateSpan(eventDate, eventDays),
    },
    {
      icon: <MapPin className="size-4 text-main-600" aria-hidden />,
      text: venue,
    },
    {
      icon: <Building2 className="size-4 text-main-600" aria-hidden />,
      text: `${participants} participant${participants === 1 ? '' : 's'}`,
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title={eventName}
        subtitle={DASHBOARD_SUBTITLE}
      />
      <EntityHero
        media={
          <HeroLogo
            image={logoUrl}
            code={eventNameFallback(eventName)}
            alt={`${eventName} logo`}
          />
        }
        title={<h2>{eventName}</h2>}
        meta={meta}
        description={header.tagline ?? undefined}
        actions={
          <>
            <Button type="button" variant="default" onClick={() => navigate('/planning')}>
              Open planning
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/itinerary')}>
              View itinerary
            </Button>
          </>
        }
      />
    </>
  );
}
