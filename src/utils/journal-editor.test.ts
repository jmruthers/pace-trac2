import { describe, it, expect } from 'vitest';
import { insertMarkdownWrapper } from '@/utils/journal-editor';

describe('journal-editor', () => {
  it('wraps the selected range with markers', () => {
    const result = insertMarkdownWrapper('hello world', 6, 11, '**', '**');
    expect(result.value).toBe('hello **world**');
    expect(result.cursor).toBe(15);
  });

  it('inserts markers at cursor when selection is empty', () => {
    const result = insertMarkdownWrapper('abc', 3, 3, '\n## ', '\n');
    expect(result.value).toBe('abc\n## \n');
    expect(result.cursor).toBe(8);
  });
});
