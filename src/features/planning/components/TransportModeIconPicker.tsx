import { Button } from '@solvera/pace-core/components';
import {
  Bus,
  Car,
  Footprints,
  Plane,
  Ship,
  TrainFront,
} from '@solvera/pace-core/icons';
import type { ComponentType } from 'react';
import {
  TRANSPORT_MODE_VALUES,
  type TransportMode,
} from '@/features/planning/enums';

const TRANSPORT_MODE_ICONS: Record<TransportMode, ComponentType<{ 'aria-hidden'?: boolean }>> = {
  Flight: Plane,
  Bus,
  Coach: Bus,
  Train: TrainFront,
  Car,
  Ferry: Ship,
  Shuttle: Bus,
  Walk: Footprints,
};

export interface TransportModeIconPickerProps {
  value: TransportMode;
  onChange: (value: TransportMode) => void;
}

export function TransportModeIconPicker({ value, onChange }: TransportModeIconPickerProps) {
  return (
    <fieldset className="grid grid-flow-col auto-cols-max gap-2" aria-label="Transport mode">
      {TRANSPORT_MODE_VALUES.map((mode) => {
        const Icon = TRANSPORT_MODE_ICONS[mode];
        const selected = value === mode;
        return (
          <Button
            key={mode}
            type="button"
            variant={selected ? 'default' : 'outline'}
            aria-pressed={selected}
            title={mode}
            onClick={() => onChange(mode)}
          >
            <Icon aria-hidden />
            <span className="sr-only">{mode}</span>
          </Button>
        );
      })}
    </fieldset>
  );
}
