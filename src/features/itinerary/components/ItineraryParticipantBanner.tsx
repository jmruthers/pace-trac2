import {
  Alert,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@solvera/pace-core/components';
import type { ItineraryParticipantOption } from '@/features/itinerary/itinerary-participant-options';

interface ItineraryParticipantBannerProps {
  participantName: string | null;
  options: ItineraryParticipantOption[];
  selectedParticipantId: string | null;
  onSelectParticipantId: (applicationId: string) => void;
  showPicker: boolean;
}

export function ItineraryParticipantBanner({
  participantName,
  options,
  selectedParticipantId,
  onSelectParticipantId,
  showPicker,
}: ItineraryParticipantBannerProps) {
  const titleSuffix = participantName != null ? ` — ${participantName}` : '';

  return (
    <Alert>
      <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <article>
          <strong>Participant itinerary{titleSuffix}</strong>
          <p>
            Showing only the transport, accommodation, and activities this participant is assigned
            to. The full event schedule is visible in planner view.
          </p>
        </article>
        {showPicker && options.length > 0 ? (
          <Label htmlFor="itinerary-viewing-as">
            Viewing as
            <Select
              value={selectedParticipantId ?? undefined}
              onValueChange={(value) => {
                if (value != null) onSelectParticipantId(value);
              }}
            >
              <SelectTrigger placeholder="Select participant">
                <SelectValue placeholder="Select participant" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Label>
        ) : null}
      </section>
    </Alert>
  );
}
