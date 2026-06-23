import { describe, it, expect } from 'vitest';
import { mergeEventCurrencyOptions } from '@/features/planning/hooks/useEventCurrencyOptions';

describe('mergeEventCurrencyOptions', () => {
  it('merges base currency and rate codes uniquely', () => {
    expect(mergeEventCurrencyOptions('AUD', ['USD', 'EUR', 'usd'])).toEqual(['AUD', 'EUR', 'USD']);
  });

  it('returns sorted codes when base is missing', () => {
    expect(mergeEventCurrencyOptions(null, ['USD', 'GBP'])).toEqual(['GBP', 'USD']);
  });
});
