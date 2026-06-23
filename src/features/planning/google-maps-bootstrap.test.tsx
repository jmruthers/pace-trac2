import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isErr } from '@solvera/pace-core/types';
import {
  ensureGoogleMapsRuntime,
  isGoogleMapsApiReady,
  loadGoogleMapsScript,
  resetGoogleMapsBootstrapForTests,
} from '@/features/planning/google-maps-bootstrap';

describe('google-maps-bootstrap', () => {
  beforeEach(() => {
    resetGoogleMapsBootstrapForTests();
    document.getElementById('trac-google-maps-script')?.remove();
    delete (globalThis as { google?: unknown }).google;
  });

  afterEach(() => {
    resetGoogleMapsBootstrapForTests();
    document.getElementById('trac-google-maps-script')?.remove();
    delete (globalThis as { google?: unknown }).google;
  });

  it('isGoogleMapsApiReady returns true when google.maps exists', () => {
    (globalThis as { google?: { maps: Record<string, never> } }).google = { maps: {} };
    expect(isGoogleMapsApiReady()).toBe(true);
  });

  it('loadGoogleMapsScript resolves immediately when google.maps already exists', async () => {
    (globalThis as { google?: { maps: Record<string, never> } }).google = { maps: {} };
    const result = await loadGoogleMapsScript('https://example.test/maps.js');
    expect(result.ok).toBe(true);
    expect(document.getElementById('trac-google-maps-script')).toBeNull();
  });

  it('ensureGoogleMapsRuntime skips edge calls when google.maps is already available', async () => {
    (globalThis as { google?: { maps: Record<string, never> } }).google = { maps: {} };
    const invoke = vi.fn();

    const result = await ensureGoogleMapsRuntime({ functions: { invoke } } as never);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toBeNull();
    }
    expect(invoke).not.toHaveBeenCalled();
  });

  it('ensureGoogleMapsRuntime returns err when the API key is missing', async () => {
    const invoke = vi
      .fn()
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({ data: { url: 'https://example.test/maps.js' } });

    const result = await ensureGoogleMapsRuntime({ functions: { invoke } } as never);

    expect(isErr(result)).toBe(true);
    expect(invoke).toHaveBeenCalledTimes(2);
  });
});
