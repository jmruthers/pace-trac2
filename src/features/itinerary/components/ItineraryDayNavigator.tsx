import type { ItineraryVisibleDateRange } from '@solvera/pace-core/itinerary';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@solvera/pace-core/components';
import { ChevronLeft, ChevronRight } from '@solvera/pace-core/icons';
import { formatDayHeading } from '@/features/planning/planning-format';
import {
  enumerateDayKeysInRange,
  shiftDayKey,
} from '@/features/itinerary/resolve-itinerary-day-navigation';

interface ItineraryDayNavigatorProps {
  range: ItineraryVisibleDateRange;
  selectedDayKey: string;
  onDayKeyChange: (dayKey: string) => void;
}

export function ItineraryDayNavigator({
  range,
  selectedDayKey,
  onDayKeyChange,
}: ItineraryDayNavigatorProps) {
  const dayKeys = enumerateDayKeysInRange(range);
  const atStart = selectedDayKey <= range.startDayKey;
  const atEnd = selectedDayKey >= range.endDayKey;

  return (
    <nav aria-label="Itinerary day" className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
      <Button
        type="button"
        variant="outline"
        aria-label="Previous day"
        disabled={atStart}
        onClick={() => onDayKeyChange(shiftDayKey(selectedDayKey, -1))}
      >
        <ChevronLeft className="size-4" aria-hidden />
      </Button>
      <Select
        value={selectedDayKey}
        onValueChange={(value) => {
          if (value != null) onDayKeyChange(value);
        }}
      >
        <SelectTrigger placeholder={formatDayHeading(selectedDayKey)}>
          <SelectValue placeholder={formatDayHeading(selectedDayKey)} />
        </SelectTrigger>
        <SelectContent>
          {dayKeys.map((dayKey) => (
            <SelectItem key={dayKey} value={dayKey}>
              {formatDayHeading(dayKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        aria-label="Next day"
        disabled={atEnd}
        onClick={() => onDayKeyChange(shiftDayKey(selectedDayKey, 1))}
      >
        <ChevronRight className="size-4" aria-hidden />
      </Button>
    </nav>
  );
}
