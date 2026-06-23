import { useMemo } from 'react';
import { useBaseCurrency } from '@/features/costs/hooks/useBaseCurrency';
import { useCurrencyRates } from '@/features/costs/hooks/useCurrencyRates';

export function mergeEventCurrencyOptions(
  baseCurrency: string | null | undefined,
  rateCodes: string[]
): string[] {
  const codes = new Set<string>();
  if (baseCurrency != null && baseCurrency !== '') {
    codes.add(baseCurrency.toUpperCase());
  }
  for (const code of rateCodes) {
    if (code !== '') {
      codes.add(code.toUpperCase());
    }
  }
  return [...codes].sort();
}

export function useEventCurrencyOptions() {
  const { rates, isLoading: ratesLoading, error: ratesError } = useCurrencyRates();
  const {
    baseCurrency,
    isLoading: baseLoading,
    isError: baseError,
  } = useBaseCurrency();

  const options = useMemo(
    () => mergeEventCurrencyOptions(baseCurrency, rates.map((rate) => rate.currency_code)),
    [baseCurrency, rates]
  );

  return {
    options,
    defaultCurrency: baseCurrency?.toUpperCase() ?? options[0] ?? null,
    isLoading: ratesLoading || baseLoading,
    isError: ratesError != null || baseError,
  };
}
