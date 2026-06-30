/** Parse event_date or date alias to epoch ms; null when missing or unparseable. */
export function readEventDateMs(event: Record<string, unknown>): number | null {
  const raw = event.event_date ?? event.date ?? null;
  if (raw == null) return null;
  const ms = Date.parse(String(raw));
  return Number.isNaN(ms) ? null : ms;
}

/** Stable tie-break id from EventStub id or event_id alias. */
export function readEventSortId(event: Record<string, unknown>): string {
  const id = event.id ?? event.event_id;
  return id != null ? String(id) : '';
}
