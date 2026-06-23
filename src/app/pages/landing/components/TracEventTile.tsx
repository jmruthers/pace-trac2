import type { KeyboardEvent } from 'react';
import { EventCard } from '@solvera/pace-core/components';
import { normalizeEventCardFields, readDirectEventLogoUrl } from '@solvera/pace-core/events';
import type { EventStub } from '@solvera/pace-core/types';
import {
  readEventDays,
  readExpectedParticipants,
} from '@/app/pages/landing/lib/event-tile-helpers';

export interface TracEventTileProps {
  event: EventStub;
  onSelect: (event: EventStub) => void;
}

function handleTileKeyDown(
  keyboardEvent: KeyboardEvent<HTMLElement>,
  onSelect: (event: EventStub) => void,
  stub: EventStub
) {
  if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
    keyboardEvent.preventDefault();
    onSelect(stub);
  }
}

export function TracEventTile({ event, onSelect }: TracEventTileProps) {
  const cardEvent = normalizeEventCardFields(event);
  const eventDays = readEventDays(event);
  const participants = readExpectedParticipants(event);
  const directImageUrl = readDirectEventLogoUrl(event);

  if (cardEvent == null) return null;

  return (
    <section
      role="button"
      tabIndex={0}
      className="h-full w-full cursor-pointer"
      onClick={() => onSelect(event)}
      onKeyDown={(keyboardEvent) => handleTileKeyDown(keyboardEvent, onSelect, event)}
    >
      <EventCard
        className="h-full w-full"
        event={cardEvent}
        image={directImageUrl}
        footer={
          <section className="inline-grid grid-flow-col auto-cols-max items-center gap-3">
            <span>
              <strong>{eventDays ?? 0}</strong> days
            </span>
            <span>
              <strong>{participants}</strong> participants
            </span>
          </section>
        }
      />
    </section>
  );
}
