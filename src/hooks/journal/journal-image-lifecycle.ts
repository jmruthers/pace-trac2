import { err, ok, type ApiResult } from '@solvera/pace-core/types';
import type { JournalImage, JournalImageInsert } from '@/types/journal';
import { JOURNAL_FILES_BUCKET, journalStorageObjectPath } from '@/utils/journal-storage';

export class JournalImageLifecycleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JournalImageLifecycleError';
  }
}

interface StorageBucketApi {
  upload: (
    path: string,
    file: File,
    options?: { upsert?: boolean }
  ) => Promise<{ data: { path: string } | null; error: { message?: string } | null }>;
  remove: (paths: string[]) => Promise<{ data: unknown; error: { message?: string } | null }>;
}

export interface JournalStorageClient {
  storage: {
    from: (bucket: string) => StorageBucketApi;
  };
}

interface SingleResult<T> {
  data: T | null;
  error: { message?: string } | null;
}

interface JournalImagesTable {
  insert: (row: JournalImageInsert) => {
    select: (columns: string) => { single: () => Promise<SingleResult<JournalImage>> };
  };
  delete: () => {
    eq: (column: string, value: string) => Promise<{ error: { message?: string } | null }>;
  };
}

export interface JournalDbClient {
  from: (table: 'trac_journal_images') => JournalImagesTable;
}

function storageErrorMessage(error: { message?: string } | null, fallback: string): string {
  return error?.message?.trim() ? error.message : fallback;
}

async function removeStorageObject(
  storageClient: JournalStorageClient,
  imageId: string
): Promise<ApiResult<void>> {
  const bucket = storageClient.storage.from(JOURNAL_FILES_BUCKET);
  const path = journalStorageObjectPath(imageId);
  const result = await bucket.remove([path]);
  if (result.error != null) {
    return err({
      code: 'JOURNAL_STORAGE_REMOVE_FAILED',
      message: storageErrorMessage(result.error, 'Failed to remove image from storage.'),
    });
  }
  return ok(undefined);
}

async function deleteImageRow(
  dbClient: JournalDbClient,
  imageId: string
): Promise<ApiResult<void>> {
  const result = await dbClient.from('trac_journal_images').delete().eq('id', imageId);
  if (result.error != null) {
    return err({
      code: 'JOURNAL_IMAGE_ROW_DELETE_FAILED',
      message: storageErrorMessage(result.error, 'Failed to remove image record.'),
    });
  }
  return ok(undefined);
}

export async function uploadJournalImage(input: {
  dbClient: JournalDbClient;
  storageClient: JournalStorageClient;
  row: JournalImageInsert;
  file: File;
}): Promise<ApiResult<JournalImage>> {
  const inserted = await input.dbClient
    .from('trac_journal_images')
    .insert(input.row)
    .select('*')
    .single();

  if (inserted.error != null || inserted.data == null) {
    return err({
      code: 'JOURNAL_IMAGE_ROW_INSERT_FAILED',
      message: storageErrorMessage(inserted.error, 'Failed to create image record.'),
    });
  }

  const imageId = inserted.data.id;
  const path = journalStorageObjectPath(imageId);
  const uploaded = await input.storageClient.storage
    .from(JOURNAL_FILES_BUCKET)
    .upload(path, input.file);

  if (uploaded.error != null) {
    const rollback = await deleteImageRow(input.dbClient, imageId);
    if (!rollback.ok) {
      return err({
        code: 'JOURNAL_IMAGE_UPLOAD_ROLLBACK_FAILED',
        message: `${storageErrorMessage(uploaded.error, 'Failed to upload image.')} The image record could not be rolled back; contact support if this persists.`,
      });
    }
    return err({
      code: 'JOURNAL_IMAGE_UPLOAD_FAILED',
      message: storageErrorMessage(uploaded.error, 'Failed to upload image.'),
    });
  }

  return ok(inserted.data);
}

export async function deleteJournalImage(input: {
  dbClient: JournalDbClient;
  storageClient: JournalStorageClient;
  imageId: string;
}): Promise<ApiResult<void>> {
  const storageResult = await removeStorageObject(input.storageClient, input.imageId);
  if (!storageResult.ok) {
    return storageResult;
  }
  return deleteImageRow(input.dbClient, input.imageId);
}

export async function removeStorageObjectsForPost(
  storageClient: JournalStorageClient,
  imageIds: readonly string[]
): Promise<ApiResult<{ removed: string[]; failures: string[] }>> {
  if (imageIds.length === 0) {
    return ok({ removed: [], failures: [] });
  }

  const paths = imageIds.map((id) => journalStorageObjectPath(id));
  const result = await storageClient.storage.from(JOURNAL_FILES_BUCKET).remove(paths);

  if (result.error != null) {
    return ok({
      removed: [],
      failures: [...imageIds],
    });
  }

  return ok({ removed: [...imageIds], failures: [] });
}
