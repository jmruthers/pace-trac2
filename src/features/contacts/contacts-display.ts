/** Display helpers for contact fields in read-only surfaces (e.g. master plan). */

export function formatContactFullName(firstName: string, surname: string): string {
  const name = [firstName, surname].filter(Boolean).join(' ').trim();
  return name !== '' ? name : '—';
}

export function formatContactOptionalField(value: string | null | undefined): string {
  if (value == null) return '—';
  const trimmed = value.trim();
  return trimmed !== '' ? trimmed : '—';
}
