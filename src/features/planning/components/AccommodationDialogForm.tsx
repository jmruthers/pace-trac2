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
import { buildAccommodationPayload } from '@/features/planning/build-payloads';
import { PlanningAttachmentsSection } from '@/features/planning/components/PlanningAttachmentsSection';
import { PlanningPlaceField } from '@/features/planning/components/PlanningPlaceField';
import { PlanningSharedFields } from '@/features/planning/components/PlanningFormFields';
import { rowToPlanningPlace } from '@/features/planning/location-snapshot';
import type { AccommodationRow, PlanningPlaceValue } from '@/features/planning/types';
import {
  accommodationFormSchema,
  type AccommodationFormValues,
} from '@/features/planning/validation';

export interface AccommodationDialogFormProps {
  mode: 'create' | 'edit';
  accommodation?: AccommodationRow;
  canSave: boolean;
  canDelete: boolean;
  onSave: (payload: ReturnType<typeof buildAccommodationPayload>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onClose: () => void;
}

function createAccommodationDefaultValues(): AccommodationFormValues {
  const now = Date.now();
  return {
    name: '',
    check_in_time: new Date(now),
    check_out_time: new Date(now + 86_400_000),
    location_label: '',
    status: 'idea',
    notes: '',
    booking_reference: '',
    currency: '',
    individual_cost: null,
    group_cost: null,
    capacity: null,
  };
}

function accommodationToFormValues(accommodation: AccommodationRow): AccommodationFormValues {
  return {
    name: accommodation.name,
    check_in_time: new Date(accommodation.check_in_time),
    check_out_time: new Date(accommodation.check_out_time),
    location_label: accommodation.location_display_name ?? '',
    status: accommodation.status ?? 'idea',
    notes: accommodation.notes ?? '',
    booking_reference: accommodation.booking_reference ?? '',
    currency: accommodation.currency ?? '',
    individual_cost: accommodation.individual_cost,
    group_cost: accommodation.group_cost,
    capacity: accommodation.capacity,
  };
}

function initialAccommodationLocation(
  accommodation: AccommodationRow | undefined
): PlanningPlaceValue | null {
  if (accommodation == null) return null;
  return rowToPlanningPlace(
    accommodation.location_place_id,
    accommodation.location_display_name,
    accommodation.location_short_address,
    accommodation.location_coords,
    accommodation.location_timezone
  );
}

export function AccommodationDialogForm({
  mode,
  accommodation,
  canSave,
  canDelete,
  onSave,
  onDelete,
  onClose,
}: AccommodationDialogFormProps) {
  const [formDefaults] = useState(() =>
    mode === 'create' || accommodation == null
      ? createAccommodationDefaultValues()
      : accommodationToFormValues(accommodation)
  );
  const [location, setLocation] = useState<PlanningPlaceValue | null>(
    initialAccommodationLocation(accommodation)
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  return (
    <>
    <Form
      schema={accommodationFormSchema}
      defaultValues={formDefaults}
      onSubmit={async (values) => {
        setSubmitError(null);
        if (!location?.displayName) {
          setSubmitError('Location is required.');
          return;
        }
        const payload = buildAccommodationPayload(
          { ...values, location_label: location.displayName },
          location
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
          <Label className="col-span-2">
            Name
            <Input
              value={methods.watch('name')}
              onChange={(value) => methods.setValue('name', value)}
            />
          </Label>
          <Label>
            Check-in
            <DateTimeField
              value={methods.watch('check_in_time')}
              onChange={(date) => methods.setValue('check_in_time', date)}
              timezone={location?.timezone ?? accommodation?.location_timezone ?? undefined}
              showTimezoneLabel
            />
          </Label>
          <Label>
            Check-out
            <DateTimeField
              value={methods.watch('check_out_time')}
              onChange={(date) => methods.setValue('check_out_time', date)}
              timezone={location?.timezone ?? accommodation?.location_timezone ?? undefined}
              showTimezoneLabel
            />
          </Label>
          <PlanningPlaceField
            label="Location"
            value={location}
            onChange={setLocation}
            required
          />
          <PlanningSharedFields
            status={methods.watch('status')}
            onStatusChange={(value) =>
              methods.setValue('status', value as AccommodationFormValues['status'])
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
              tableName="trac_accommodation"
              recordId={accommodation?.id ?? null}
              canWrite={canSave}
            />
          </article>
          <DialogFooter className="col-span-2">
            {mode === 'edit' && accommodation?.id && onDelete && canDelete ? (
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
      title="Delete accommodation"
      description={
        accommodation?.name
          ? `This will permanently remove ${accommodation.name}. Related assignments may be affected.`
          : 'This will permanently remove this accommodation. Related assignments may be affected.'
      }
      confirmLabel="Delete"
      variant="destructive"
      onConfirm={async () => {
        if (accommodation?.id && onDelete) {
          await onDelete(accommodation.id);
          onClose();
        }
      }}
    />
    </>
  );
}
