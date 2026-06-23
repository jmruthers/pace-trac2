import { useState } from 'react';
import {
  Alert,
  Button,
  ConfirmationDialog,
  DateTimeField,
  DialogFooter,
  Form,
  Input,
  Label,
} from '@solvera/pace-core/components';
import { buildTransportPayload } from '@/features/planning/build-payloads';
import { PlanningAttachmentsSection } from '@/features/planning/components/PlanningAttachmentsSection';
import { PlanningPlaceField } from '@/features/planning/components/PlanningPlaceField';
import { PlanningSharedFields } from '@/features/planning/components/PlanningFormFields';
import { TransportModeIconPicker } from '@/features/planning/components/TransportModeIconPicker';
import { rowToPlanningPlace } from '@/features/planning/location-snapshot';
import type { PlanningPlaceValue, TransportRow } from '@/features/planning/types';
import {
  transportFormSchema,
  type TransportFormValues,
} from '@/features/planning/validation';

export interface TransportDialogFormProps {
  mode: 'create' | 'edit';
  transport?: TransportRow;
  canSave: boolean;
  canDelete: boolean;
  onSave: (payload: ReturnType<typeof buildTransportPayload>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onClose: () => void;
}

function createTransportDefaultValues(): TransportFormValues {
  const now = Date.now();
  return {
    mode: 'Flight',
    transport_number: '',
    departure_time: new Date(now),
    arrival_time: new Date(now + 3_600_000),
    departure_label: '',
    arrival_label: '',
    status: 'idea',
    notes: '',
    booking_reference: '',
    currency: '',
    individual_cost: null,
    group_cost: null,
    capacity: null,
  };
}

function transportToFormValues(transport: TransportRow): TransportFormValues {
  return {
    mode: transport.mode,
    transport_number: transport.transport_number ?? '',
    departure_time: new Date(transport.departure_time),
    arrival_time: new Date(transport.arrival_time),
    departure_label: transport.departure_display_name ?? '',
    arrival_label: transport.arrival_display_name ?? '',
    status: transport.status ?? 'idea',
    notes: transport.notes ?? '',
    booking_reference: transport.booking_reference ?? '',
    currency: transport.currency ?? '',
    individual_cost: transport.individual_cost,
    group_cost: transport.group_cost,
    capacity: transport.capacity,
  };
}

function initialTransportPlaces(transport: TransportRow | undefined): {
  departure: PlanningPlaceValue | null;
  arrival: PlanningPlaceValue | null;
} {
  if (transport == null) {
    return { departure: null, arrival: null };
  }
  return {
    departure: rowToPlanningPlace(
      transport.departure_place_id,
      transport.departure_display_name,
      transport.departure_short_address,
      transport.departure_coords,
      transport.departure_timezone
    ),
    arrival: rowToPlanningPlace(
      transport.arrival_place_id,
      transport.arrival_display_name,
      transport.arrival_short_address,
      transport.arrival_coords,
      transport.arrival_timezone
    ),
  };
}

function resolvePlaceTimezone(
  place: PlanningPlaceValue | null,
  savedTimezone: string | null | undefined
): string | undefined {
  return place?.timezone ?? savedTimezone ?? undefined;
}

export function TransportDialogForm({
  mode,
  transport,
  canSave,
  canDelete,
  onSave,
  onDelete,
  onClose,
}: TransportDialogFormProps) {
  const initialPlaces = initialTransportPlaces(transport);
  const [formDefaults] = useState(() =>
    mode === 'create' || transport == null
      ? createTransportDefaultValues()
      : transportToFormValues(transport)
  );
  const [departure, setDeparture] = useState<PlanningPlaceValue | null>(initialPlaces.departure);
  const [arrival, setArrival] = useState<PlanningPlaceValue | null>(initialPlaces.arrival);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const departureTimezone = resolvePlaceTimezone(departure, transport?.departure_timezone);
  const arrivalTimezone = resolvePlaceTimezone(arrival, transport?.arrival_timezone);

  return (
    <>
    <Form
      schema={transportFormSchema}
      defaultValues={formDefaults}
      onSubmit={async (values) => {
        setSubmitError(null);
        if (!departure?.displayName || !arrival?.displayName) {
          setSubmitError('Departure and arrival locations are required.');
          return;
        }
        const payload = buildTransportPayload(
          {
            ...values,
            departure_label: departure.displayName,
            arrival_label: arrival.displayName,
          },
          departure,
          arrival
        );
        try {
          await onSave(payload);
          onClose();
        } catch (error) {
          setSubmitError(error instanceof Error ? error.message : 'Save failed');
        }
      }}
    >
      {(methods) => (
        <section className="grid grid-cols-2 gap-4">
          {submitError ? (
            <Alert variant="destructive" className="col-span-2">
              {submitError}
            </Alert>
          ) : null}
          <fieldset className="col-span-2 grid gap-2" aria-label="Mode">
            <TransportModeIconPicker
              value={methods.watch('mode')}
              onChange={(value) => methods.setValue('mode', value)}
            />
          </fieldset>
          <Label>
            Transport number
            <Input
              value={methods.watch('transport_number') ?? ''}
              onChange={(value) => methods.setValue('transport_number', value)}
            />
          </Label>
          <Label>
            Departure time
            <DateTimeField
              value={methods.watch('departure_time')}
              onChange={(date) => methods.setValue('departure_time', date)}
              timezone={departureTimezone}
              showTimezoneLabel
            />
          </Label>
          <Label>
            Arrival time
            <DateTimeField
              value={methods.watch('arrival_time')}
              onChange={(date) => methods.setValue('arrival_time', date)}
              timezone={arrivalTimezone}
              showTimezoneLabel
            />
          </Label>
          <PlanningPlaceField
            label="Departure"
            value={departure}
            onChange={setDeparture}
            required
          />
          <PlanningPlaceField label="Arrival" value={arrival} onChange={setArrival} required />
          <PlanningSharedFields
            status={methods.watch('status')}
            onStatusChange={(value) =>
              methods.setValue('status', value as TransportFormValues['status'])
            }
            capacity={methods.watch('capacity')}
            onCapacityChange={(value) => methods.setValue('capacity', value)}
            notes={methods.watch('notes') ?? ''}
            onNotesChange={(value) => methods.setValue('notes', value)}
            bookingReference={methods.watch('booking_reference') ?? ''}
            onBookingReferenceChange={(value) => methods.setValue('booking_reference', value)}
            currency={methods.watch('currency') ?? ''}
            onCurrencyChange={(value) => methods.setValue('currency', value)}
            individualCost={methods.watch('individual_cost')}
            onIndividualCostChange={(value) => methods.setValue('individual_cost', value)}
            groupCost={methods.watch('group_cost')}
            onGroupCostChange={(value) => methods.setValue('group_cost', value)}
          />
          <article className="col-span-2">
            <PlanningAttachmentsSection
              tableName="trac_transport"
              recordId={transport?.id ?? null}
              canWrite={canSave}
            />
          </article>
          <DialogFooter className="col-span-2">
            {mode === 'edit' && transport?.id && onDelete && canDelete ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                Delete
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSave}>
              Save
            </Button>
          </DialogFooter>
        </section>
      )}
    </Form>
    <ConfirmationDialog
      open={deleteConfirmOpen}
      onOpenChange={setDeleteConfirmOpen}
      title="Delete transport"
      description={
        transport
          ? `This will permanently remove this ${transport.mode.toLowerCase()}${transport.transport_number ? ` (${transport.transport_number})` : ''}. Related assignments may be affected.`
          : 'This will permanently remove this transport item. Related assignments may be affected.'
      }
      confirmLabel="Delete"
      variant="destructive"
      onConfirm={async () => {
        if (transport?.id && onDelete) {
          await onDelete(transport.id);
          onClose();
        }
      }}
    />
    </>
  );
}
