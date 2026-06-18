import { EventTile, EventTileMetaRow } from '@solvera/pace-core/components';
import { Calendar, MapPin } from '@solvera/pace-core/icons';
import type { EventStub } from '@solvera/pace-core/types';
import { formatEventDateChip } from '@/app/pages/landing/lib/formatEventDateChip';
import {
  eventNameFallback,
  formatEventDateSpan,
  readEventCode,
  readEventDate,
  readEventDays,
  readEventLogoUrl,
  readEventName,
  readEventVenue,
  readExpectedParticipants,
} from '@/app/pages/landing/lib/event-tile-helpers';

export interface TracEventTileProps {
  event: EventStub;
  onSelect: (event: EventStub) => void;
}

export function TracEventTile({ event, onSelect }: TracEventTileProps) {
  const eventName = readEventName(event);
  const eventDate = readEventDate(event);
  const eventDays = readEventDays(event);
  const venue = readEventVenue(event);
  const participants = readExpectedParticipants(event);
  const logoUrl = readEventLogoUrl(event);
  const hasVenue = venue !== '-';

  return (
    <EventTile
      className="h-full w-full"
      title={eventName}
      dateChip={formatEventDateChip(eventDate)}
      image={logoUrl}
      imageGlyph={logoUrl == null ? <strong>{eventNameFallback(eventName)}</strong> : undefined}
      imageLabel={readEventCode(event)}
      meta={
        <>
          <EventTileMetaRow icon={<Calendar className="size-3.5 shrink-0" aria-hidden />}>
            {formatEventDateSpan(eventDate, eventDays)}
          </EventTileMetaRow>
          {hasVenue ? (
            <EventTileMetaRow icon={<MapPin className="size-3.5 shrink-0" aria-hidden />}>
              {venue}
            </EventTileMetaRow>
          ) : null}
        </>
      }
      foot={
        <section className="inline-grid grid-flow-col auto-cols-max items-center gap-3">
          <span>
            <strong>{eventDays ?? 0}</strong> days
          </span>
          <span>
            <strong>{participants}</strong> participants
          </span>
        </section>
      }
      onClick={() => onSelect(event)}
    />
  );
}
