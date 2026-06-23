import { describe, it, expect } from 'vitest';
import {
  formatContactFullName,
  formatContactOptionalField,
} from '@/features/contacts/contacts-display';

describe('contacts-display', () => {
  describe('formatContactFullName', () => {
    it('joins first and surname', () => {
      expect(formatContactFullName('Jane', 'Planner')).toBe('Jane Planner');
    });

    it('returns em dash when both names are empty', () => {
      expect(formatContactFullName('', '')).toBe('—');
    });
  });

  describe('formatContactOptionalField', () => {
    it('returns trimmed value when present', () => {
      expect(formatContactOptionalField('  Guide  ')).toBe('Guide');
    });

    it('returns em dash for null, undefined, or blank', () => {
      expect(formatContactOptionalField(null)).toBe('—');
      expect(formatContactOptionalField(undefined)).toBe('—');
      expect(formatContactOptionalField('   ')).toBe('—');
    });
  });
});
