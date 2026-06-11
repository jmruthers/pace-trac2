import { Badge, type BadgeVariant } from '@solvera/pace-core/components';
import type { CapacityPressure } from '@/features/assignments/headcount';

const PRESSURE_LABEL: Record<CapacityPressure, string> = {
  ok: 'Within capacity',
  near: 'Near capacity',
  over: 'Over capacity',
};

const PRESSURE_VARIANT: Record<CapacityPressure, BadgeVariant> = {
  ok: 'outline-main-muted',
  near: 'outline-acc-muted',
  over: 'outline-acc-strong',
};

interface CapacityPressureBadgeProps {
  pressure: CapacityPressure;
}

export function CapacityPressureBadge({ pressure }: CapacityPressureBadgeProps) {
  return <Badge variant={PRESSURE_VARIANT[pressure]}>{PRESSURE_LABEL[pressure]}</Badge>;
}
