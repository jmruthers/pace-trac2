import { Badge } from '@solvera/pace-core/components';

interface ItineraryDayHeaderProps {
  dayIndex: number;
  itemCount: number;
}

export function ItineraryDayHeader({ dayIndex, itemCount }: ItineraryDayHeaderProps) {
  const countLabel = `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`;

  return (
    <header className="grid grid-cols-[1fr_auto] items-center gap-3">
      <Badge variant="outline-sec-muted">Day {dayIndex + 1}</Badge>
      <p>{countLabel}</p>
    </header>
  );
}
