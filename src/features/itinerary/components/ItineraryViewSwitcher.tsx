import { Button } from '@solvera/pace-core/components';
import type { ItineraryViewMode } from '@/features/itinerary/types';

interface ItineraryViewSwitcherProps {
  viewMode: ItineraryViewMode;
  onViewModeChange: (mode: ItineraryViewMode) => void;
}

export function ItineraryViewSwitcher({
  viewMode,
  onViewModeChange,
}: ItineraryViewSwitcherProps) {
  return (
    <fieldset className="grid grid-flow-col auto-cols-max gap-2" aria-label="Itinerary view">
      <Button
        type="button"
        variant={viewMode === 'planner' ? 'default' : 'outline'}
        aria-pressed={viewMode === 'planner'}
        onClick={() => onViewModeChange('planner')}
      >
        Planner view
      </Button>
      <Button
        type="button"
        variant={viewMode === 'participant' ? 'default' : 'outline'}
        aria-pressed={viewMode === 'participant'}
        onClick={() => onViewModeChange('participant')}
      >
        Participant view
      </Button>
    </fieldset>
  );
}
