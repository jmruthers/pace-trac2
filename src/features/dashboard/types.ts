import type { FileReference } from '@solvera/pace-core/types';

export interface DashboardEventHeader {
  eventId: string;
  title: string;
  tagline: string | null;
  logoFileReference: FileReference | null;
}
