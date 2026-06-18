import { useCallback, useState } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  PaceAppLayout,
  LoadingSpinner,
  Dialog,
  DialogPortal,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  PasswordChangeForm,
} from '@solvera/pace-core/components';
import { useContextTheme, useOptionalEvents } from '@solvera/pace-core/hooks';
import { useUnifiedAuthContext } from '@solvera/pace-core';
import { AccessDenied, usePageCan } from '@solvera/pace-core/rbac';
import { APP_NAME } from '@/app-config';
import { getTracNavigationItemsForShell } from '@/app/navigation/trac-nav';
import { getTracRoutePermissionForPath } from '@/app/navigation/trac-route-permissions';
import {
  LEGACY_USER_DASHBOARD_PATH,
  TRAC_AUTHENTICATED_HOME_PATH,
  resolveUserDashboardRedirectTarget,
} from '@/app/routes/route-redirects';
import { DashboardPage } from '@/app/pages/DashboardPage';
import { TracEventsLandingPage } from '@/app/pages/landing/TracEventsLandingPage';
import { ContactsPage } from '@/app/pages/ContactsPage';
import { JournalPage } from '@/app/pages/JournalPage';
import { AssignmentsPage } from '@/app/pages/AssignmentsPage';
import { PlanningPage } from '@/app/pages/PlanningPage';
import { RisksPage } from '@/app/pages/RisksPage';
import { ItineraryPage } from '@/app/pages/ItineraryPage';
import { CostsPage } from '@/app/pages/CostsPage';
import { MasterPlanPage } from '@/app/pages/MasterPlanPage';
import { CurrencyRatesPage } from '@/app/pages/CurrencyRatesPage';
import { NotFoundPage } from '@/app/pages/NotFoundPage';

function getUserDisplayName(user: {
  email?: string;
  user_metadata?: Record<string, unknown>;
} | null | undefined): string {
  if (user == null) return '';
  const metadata = user.user_metadata ?? {};
  const keys = ['full_name', 'name', 'display_name'] as const;
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === 'string' && value.trim() !== '') return value.trim();
  }
  const firstName = typeof metadata.first_name === 'string' ? metadata.first_name.trim() : '';
  const lastName = typeof metadata.last_name === 'string' ? metadata.last_name.trim() : '';
  const combined = `${firstName} ${lastName}`.trim();
  if (combined !== '') return combined;
  return user.email?.trim() ?? '';
}

function useTracShellRouteAccessDenied(): boolean {
  const { pathname } = useLocation();
  const routePermission = getTracRoutePermissionForPath(pathname);
  const pageName = routePermission?.pageName ?? '';
  const { can, isLoading } = usePageCan(
    pageName,
    routePermission?.operation ?? 'read',
    undefined,
    pageName || undefined
  );
  if (routePermission == null) return false;
  if (isLoading) return false;
  return !can;
}

function EventScopedOutlet() {
  const { selectedEvent, isLoading } = useOptionalEvents();

  if (isLoading) {
    return (
      <section className="grid min-h-[50vh] place-items-center px-4" aria-busy="true">
        <LoadingSpinner label="Loading event context…" />
      </section>
    );
  }

  if (selectedEvent == null) {
    return <Navigate to={TRAC_AUTHENTICATED_HOME_PATH} replace />;
  }

  return <Outlet />;
}

function AuthenticatedShellLayout() {
  useContextTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const routeAccessDenied = useTracShellRouteAccessDenied();
  const { selectedEvent, setSelectedEvent } = useOptionalEvents();
  const { user, signOut, updatePassword } = useUnifiedAuthContext();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const userDisplayName = getUserDisplayName(user);
  const userEmail = user?.email?.trim() ?? '';
  const hasSelectedEvent = selectedEvent != null;
  const showEventsInContextSelector = pathname !== TRAC_AUTHENTICATED_HOME_PATH;
  const navItems = getTracNavigationItemsForShell(hasSelectedEvent);

  const handleUserMenuSignOut = useCallback(() => {
    void signOut();
  }, [signOut]);

  const handleOpenChangePassword = useCallback(() => {
    setIsChangePasswordOpen(true);
  }, []);

  const handleCloseChangePassword = useCallback(() => {
    setIsChangePasswordOpen(false);
  }, []);

  const handlePasswordChange = useCallback(
    async (values: { newPassword: string; confirmPassword: string }) => {
      const result = await updatePassword(values.newPassword);
      if (result.error != null) {
        return { error: { message: result.error.message } };
      }
      return {};
    },
    [updatePassword]
  );

  const handleAllEventsSelect = useCallback(() => {
    setSelectedEvent(null);
    navigate(TRAC_AUTHENTICATED_HOME_PATH);
  }, [navigate, setSelectedEvent]);

  const homePath = resolveUserDashboardRedirectTarget();

  return (
    <>
      <PaceAppLayout
        appName={APP_NAME}
        userFullName={userDisplayName}
        userEmail={userEmail}
        onUserMenuSignOut={handleUserMenuSignOut}
        onUserMenuChangePassword={handleOpenChangePassword}
        navItems={navItems}
        logoHref={homePath}
        showContextSelector
        showOrganisations
        showEvents={showEventsInContextSelector}
        enforcePermissions
        routeAccessDenied={routeAccessDenied}
        permissionFallback={<AccessDenied />}
        extraMenuActions={[
          {
            id: 'all-events',
            label: 'All events',
            onSelect: handleAllEventsSelect,
          },
        ]}
      >
        <Outlet />
      </PaceAppLayout>
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogPortal>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Account settings</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <PasswordChangeForm
                onSubmit={handlePasswordChange}
                onSuccess={handleCloseChangePassword}
                onCancel={handleCloseChangePassword}
              />
            </DialogBody>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
}

export function AuthenticatedRoutes() {
  const homePath = resolveUserDashboardRedirectTarget();

  return (
    <Routes>
      <Route path="/" element={<AuthenticatedShellLayout />}>
        <Route
          path={LEGACY_USER_DASHBOARD_PATH.slice(1)}
          element={<Navigate to={homePath} replace />}
        />
        <Route index element={<TracEventsLandingPage />} />
        <Route element={<EventScopedOutlet />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="planning" element={<PlanningPage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
          <Route path="itinerary" element={<ItineraryPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="journal" element={<JournalPage />} />
          <Route path="risks" element={<RisksPage />} />
          <Route path="costs" element={<CostsPage />} />
          <Route path="masterplan" element={<MasterPlanPage />} />
          <Route path="currency-rates" element={<CurrencyRatesPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
