/** Target for legacy `/user-dashboard` redirect (TRAC authenticated home). */
export const TRAC_AUTHENTICATED_HOME_PATH = '/' as const;

/** Legacy path that must redirect to the authenticated home. */
export const LEGACY_USER_DASHBOARD_PATH = '/user-dashboard' as const;

export function resolveUserDashboardRedirectTarget(): typeof TRAC_AUTHENTICATED_HOME_PATH {
  return TRAC_AUTHENTICATED_HOME_PATH;
}
