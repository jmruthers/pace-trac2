/** Insert markdown wrapper around the current textarea selection (or append). */
export function insertMarkdownWrapper(
  current: string,
  selectionStart: number,
  selectionEnd: number,
  before: string,
  after: string
): { value: string; cursor: number } {
  const start = Math.max(0, Math.min(selectionStart, current.length));
  const end = Math.max(start, Math.min(selectionEnd, current.length));
  const selected = current.slice(start, end);
  const value = `${current.slice(0, start)}${before}${selected}${after}${current.slice(end)}`;
  const cursor = start + before.length + selected.length + after.length;
  return { value, cursor };
}
