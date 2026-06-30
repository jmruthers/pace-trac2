/** Start of local calendar day (midnight) for referenceDate, as epoch ms. */
export function getLocalDayStartMs(referenceDate: Date = new Date()): number {
  const cutoff = new Date(referenceDate);
  cutoff.setHours(0, 0, 0, 0);
  return cutoff.getTime();
}
