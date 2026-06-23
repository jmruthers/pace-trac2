import { Badge, Button, type BadgeVariant } from '@solvera/pace-core/components';
import {
  TRAC_STATUS_LABELS,
  TRAC_STATUS_VALUES,
  type TracStatus,
} from '@/features/planning/enums';

const STATUS_VARIANT: Record<TracStatus, BadgeVariant> = {
  idea: 'outline-main-muted',
  planned: 'soft-sec-muted',
  booked: 'solid-main-muted',
  confirmed: 'solid-main-normal',
  dropped: 'soft-sec-normal',
  cancelled: 'solid-acc-muted',
};

export interface PlanningStatusPickerProps {
  value: TracStatus;
  onChange: (value: TracStatus) => void;
}

export function PlanningStatusPicker({ value, onChange }: PlanningStatusPickerProps) {
  return (
    <fieldset
      className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-2"
      aria-label="Status"
    >
      {TRAC_STATUS_VALUES.map((status) => {
        const selected = value === status;
        return (
          <Button
            key={status}
            type="button"
            variant={selected ? 'default' : 'outline'}
            aria-pressed={selected}
            onClick={() => onChange(status)}
          >
            <Badge variant={STATUS_VARIANT[status]}>{TRAC_STATUS_LABELS[status]}</Badge>
          </Button>
        );
      })}
    </fieldset>
  );
}
