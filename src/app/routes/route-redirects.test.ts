import { describe, it, expect } from 'vitest';
import {
  TRAC_AUTHENTICATED_HOME_PATH,
  LEGACY_USER_DASHBOARD_PATH,
  resolveUserDashboardRedirectTarget,
} from '@/app/routes/route-redirects';

describe('route-redirects', () => {
  it('defines authenticated home as /', () => {
    expect(TRAC_AUTHENTICATED_HOME_PATH).toBe('/');
  });

  it('defines legacy user-dashboard path', () => {
    expect(LEGACY_USER_DASHBOARD_PATH).toBe('/user-dashboard');
  });

  it('resolveUserDashboardRedirectTarget returns authenticated home', () => {
    expect(resolveUserDashboardRedirectTarget()).toBe('/');
  });
});
