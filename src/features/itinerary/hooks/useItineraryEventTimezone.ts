import { useMemo } from 'react';
import { useEvents } from '@solvera/pace-core/hooks';
import { formatTimezoneLabel } from '@solvera/pace-core/utils';

function readString(record: Record<string, unknown> | null | undefined, keys: readonly string[]): string | null {
  if (record == null) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim() !== '') return value.trim();
  }
  return null;
}

export interface ItineraryEventTimezone {
  /** IANA timezone when available on the event record. */
  ianaTimezone: string | null;
  /** Short label for view-switch footer, e.g. "AEDT" or "Australia/Sydney (GMT+11)". */
  footerCaption: string | null;
}

export function useItineraryEventTimezone(): ItineraryEventTimezone {
  const { selectedEvent } = useEvents();
  const record = selectedEvent as Record<string, unknown> | null | undefined;

  return useMemo(() => {
    const ianaTimezone = readString(record, [
      'timezone_iana',
      'event_timezone',
      'timezone',
      'default_timezone',
    ]);
    const shortLabel = readString(record, ['timezone_label', 'tz_label']);
    const tzOffset = readString(record, ['tz_offset', 'timezone_offset']);

    if (ianaTimezone != null) {
      return {
        ianaTimezone,
        footerCaption: formatTimezoneLabel(ianaTimezone),
      };
    }

    if (shortLabel != null) {
      const caption = tzOffset != null ? `${shortLabel} (${tzOffset})` : shortLabel;
      return { ianaTimezone: null, footerCaption: caption };
    }

    return { ianaTimezone: null, footerCaption: null };
  }, [record]);
}
