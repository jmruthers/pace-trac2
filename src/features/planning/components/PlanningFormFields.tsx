import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@solvera/pace-core/components';
import { PlanningStatusPicker } from '@/features/planning/components/PlanningStatusPicker';
import { useEventCurrencyOptions } from '@/features/planning/hooks/useEventCurrencyOptions';
import type { TracStatus } from '@/features/planning/enums';

export type PlanningCostBasis = 'individual' | 'group';

export function deriveCostBasis(
  individualCost: number | null,
  groupCost: number | null
): PlanningCostBasis {
  const hasIndividual = individualCost != null && individualCost !== 0;
  const hasGroup = groupCost != null && groupCost !== 0;
  if (hasIndividual) return 'individual';
  if (hasGroup) return 'group';
  return 'individual';
}

interface PlanningSharedFieldsProps {
  status: string;
  onStatusChange: (value: string) => void;
  capacity: number | null;
  onCapacityChange: (value: number | null) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  bookingReference: string;
  onBookingReferenceChange: (value: string) => void;
  currency: string;
  onCurrencyChange: (value: string) => void;
  individualCost: number | null;
  onIndividualCostChange: (value: number | null) => void;
  groupCost: number | null;
  onGroupCostChange: (value: number | null) => void;
}

export function PlanningSharedFields({
  status,
  onStatusChange,
  capacity,
  onCapacityChange,
  notes,
  onNotesChange,
  bookingReference,
  onBookingReferenceChange,
  currency,
  onCurrencyChange,
  individualCost,
  onIndividualCostChange,
  groupCost,
  onGroupCostChange,
}: PlanningSharedFieldsProps) {
  const { options, defaultCurrency, isLoading: currenciesLoading, isError: currenciesError } =
    useEventCurrencyOptions();

  const [costBasis, setCostBasis] = useState<PlanningCostBasis>(() =>
    deriveCostBasis(individualCost, groupCost)
  );

  useEffect(() => {
    if (currency === '' && defaultCurrency != null) {
      onCurrencyChange(defaultCurrency);
    }
  }, [currency, defaultCurrency, onCurrencyChange]);

  const activeCost = costBasis === 'individual' ? individualCost : groupCost;

  const handleCostChange = (value: number | null) => {
    if (costBasis === 'individual') {
      onIndividualCostChange(value);
      onGroupCostChange(null);
      return;
    }
    onGroupCostChange(value);
    onIndividualCostChange(null);
  };

  const handleCostBasisChange = (nextBasis: PlanningCostBasis) => {
    if (nextBasis === costBasis) return;
    const currentValue = activeCost;
    setCostBasis(nextBasis);
    if (nextBasis === 'individual') {
      onIndividualCostChange(currentValue);
      onGroupCostChange(null);
      return;
    }
    onGroupCostChange(currentValue);
    onIndividualCostChange(null);
  };

  return (
    <>
      <fieldset className="col-span-2 grid gap-2">
        <p>Status</p>
        <PlanningStatusPicker
          value={status as TracStatus}
          onChange={(value) => onStatusChange(value)}
        />
      </fieldset>
      <Label>
        Capacity (leave empty for uncapped)
        <Input
          type="number"
          value={capacity == null ? '' : String(capacity)}
          onChange={(value) => onCapacityChange(value === '' ? null : Number(value))}
        />
      </Label>
      <Label>
        Booking reference
        <Input value={bookingReference} onChange={onBookingReferenceChange} />
      </Label>
      {currenciesError || (!currenciesLoading && options.length === 0) ? (
        <Alert variant="destructive" className="col-span-2">
          No currencies configured for this event. Add currency rates on the costs page.
        </Alert>
      ) : (
        <fieldset className="col-span-2 grid grid-cols-3 gap-4 items-end">
          <Label>
            Currency
            <Select
              value={currency || undefined}
              onValueChange={(value) => value != null && onCurrencyChange(value)}
            >
              <SelectTrigger disabled={currenciesLoading || options.length === 0}>
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                {options.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Label>
          <fieldset className="grid gap-2">
            <p>Cost basis</p>
            <fieldset className="grid grid-flow-col auto-cols-max gap-2" aria-label="Cost basis">
              <Button
                type="button"
                variant={costBasis === 'individual' ? 'default' : 'outline'}
                aria-pressed={costBasis === 'individual'}
                onClick={() => handleCostBasisChange('individual')}
              >
                Per person
              </Button>
              <Button
                type="button"
                variant={costBasis === 'group' ? 'default' : 'outline'}
                aria-pressed={costBasis === 'group'}
                onClick={() => handleCostBasisChange('group')}
              >
                For group
              </Button>
            </fieldset>
          </fieldset>
          <Label>
            {costBasis === 'individual' ? 'Cost per person' : 'Cost for group'}
            <Input
              type="number"
              value={activeCost == null ? '' : String(activeCost)}
              onChange={(value) => handleCostChange(value === '' ? null : Number(value))}
            />
          </Label>
        </fieldset>
      )}
      <Label className="col-span-2">
        Notes
        <Textarea value={notes} onChange={onNotesChange} />
      </Label>
    </>
  );
}
