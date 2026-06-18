import { formatDate } from '@solvera/pace-core/utils';
import type { EventStub } from '@solvera/pace-core/types';

const EMPTY_LABEL = '-';

function readStringField(event: EventStub | null, keys: readonly string[]): string | null {
  if (event == null) return null;
  for (const key of keys) {
    const value = event[key];
    if (typeof value === 'string' && value.trim() !== '') return value.trim();
  }
  return null;
}

function readNumberField(event: EventStub | null, keys: readonly string[]): number | null {
  if (event == null) return null;
  for (const key of keys) {
    const value = event[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return null;
}

function readBooleanField(event: EventStub | null, keys: readonly string[]): boolean | null {
  if (event == null) return null;
  for (const key of keys) {
    const value = event[key];
    if (typeof value === 'boolean') return value;
  }
  return null;
}

export function readEventName(event: EventStub | null): string {
  return readStringField(event, ['event_name', 'name']) ?? 'Event';
}

export function readEventVenue(event: EventStub | null): string {
  return readStringField(event, ['event_venue', 'venue']) ?? EMPTY_LABEL;
}

export function readEventLogoUrl(event: EventStub | null): string | undefined {
  const logo = readStringField(event, ['event_logo', 'logo', 'logo_url']);
  return logo ?? undefined;
}

export function readExpectedParticipants(event: EventStub | null): number {
  return readNumberField(event, ['expected_participants', 'event_participants', 'participant_count']) ?? 0;
}

export function readEventDays(event: EventStub | null): number | null {
  return readNumberField(event, ['event_days']);
}

export function readEventDate(event: EventStub | null): string | null {
  return readStringField(event, ['event_date', 'date']);
}

export function readEventCode(event: EventStub | null): string {
  const code = readStringField(event, ['event_code', 'code']);
  return code != null ? code.toUpperCase() : 'EVENT';
}

export function isEventVisible(event: EventStub): boolean {
  const visible = readBooleanField(event, ['is_visible']);
  return visible !== false;
}

export function eventNameFallback(name: string, fallback = 'EV', max = 3): string {
  if (name.trim() === '') return fallback;
  const tokens = name.split(/[\s\-_]+/).filter((token) => token.length > 0);
  if (tokens.length === 0) return fallback;
  return tokens
    .map((token) => (token[0] ?? '').toUpperCase())
    .join('')
    .slice(0, max);
}

function parseEventDate(iso: string): Date | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatEventDateSpan(iso: string | null, days: number | null): string {
  if (iso == null || iso === '') return EMPTY_LABEL;
  const start = parseEventDate(iso);
  if (start == null) return iso;
  if (days == null || days <= 1) return formatDate(start);

  const end = new Date(start);
  end.setDate(start.getDate() + (days - 1));

  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    return `${formatDate(start)} – ${end.getDate()}`;
  }
  return `${formatDate(start)} – ${formatDate(end)}`;
}
