import { lazy, Suspense, type ReactNode } from 'react';
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
import { TracEventsLandingPage } from '@/app/pages/landing/TracEventsLandingPage';
import { NotFoundPage } from '@/app/pages/NotFoundPage';

const DashboardPage = lazy(() =>
  import('@/app/pages/DashboardPage').then((module) => ({ default: module.DashboardPage }))
);
const ContactsPage = lazy(() =>
  import('@/app/pages/ContactsPage').then((module) => ({ default: module.ContactsPage }))
);
const JournalPage = lazy(() =>
  import('@/app/pages/JournalPage').then((module) => ({ default: module.JournalPage }))
);
const AssignmentsPage = lazy(() =>
  import('@/app/pages/AssignmentsPage').then((module) => ({ default: module.AssignmentsPage }))
);
const PlanningPage = lazy(() =>
  import('@/app/pages/PlanningPage').then((module) => ({ default: module.PlanningPage }))
);
const RisksPage = lazy(() =>
  import('@/app/pages/RisksPage').then((module) => ({ default: module.RisksPage }))
);
const ItineraryPage = lazy(() =>
  import('@/app/pages/ItineraryPage').then((module) => ({ default: module.ItineraryPage }))
);
const CostsPage = lazy(() =>
  import('@/app/pages/CostsPage').then((module) => ({ default: module.CostsPage }))
);
const CurrencyRatesPage = lazy(() =>
  import('@/app/pages/CurrencyRatesPage').then((module) => ({ default: module.CurrencyRatesPage }))
);
const MasterPlanPage = lazy(() =>
  import('@/app/pages/MasterPlanPage').then((module) => ({ default: module.MasterPlanPage }))
);

function RoutePageFallback() {
  return (
    <section className="grid min-h-[50vh] place-items-center px-4" aria-busy="true">
      <LoadingSpinner label="Loading page…" />
    </section>
  );
}

function LazyRoutePage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RoutePageFallback />}>{children}</Suspense>;
}

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
  const routePermission = getTracRoutePermissionForPath(pathname);
  const pageName = routePermission?.pageName ?? '';
  const operation = routePermission?.operation ?? 'read';
  const { can, isLoading: pageCanLoading } = usePageCan(
    pageName,
    operation,
    undefined,
    pageName || undefined
  );
  const routeAccessDenied =
    routePermission != null && pageName !== '' && !pageCanLoading && !can;
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
          <Route
            path="dashboard"
            element={
              <LazyRoutePage>
                <DashboardPage />
              </LazyRoutePage>
            }
          />
          <Route
            path="planning"
            element={
              <LazyRoutePage>
                <PlanningPage />
              </LazyRoutePage>
            }
          />
          <Route
            path="assignments"
            element={
              <LazyRoutePage>
                <AssignmentsPage />
              </LazyRoutePage>
            }
          />
          <Route
            path="itinerary"
            element={
              <LazyRoutePage>
                <ItineraryPage />
              </LazyRoutePage>
            }
          />
          <Route
            path="contacts"
            element={
              <LazyRoutePage>
                <ContactsPage />
              </LazyRoutePage>
            }
          />
          <Route
            path="journal"
            element={
              <LazyRoutePage>
                <JournalPage />
              </LazyRoutePage>
            }
          />
          <Route
            path="risks"
            element={
              <LazyRoutePage>
                <RisksPage />
              </LazyRoutePage>
            }
          />
          <Route
            path="costs"
            element={
              <LazyRoutePage>
                <CostsPage />
              </LazyRoutePage>
            }
          />
          <Route
            path="currency-rates"
            element={
              <LazyRoutePage>
                <CurrencyRatesPage />
              </LazyRoutePage>
            }
          />
          <Route
            path="masterplan"
            element={
              <LazyRoutePage>
                <MasterPlanPage />
              </LazyRoutePage>
            }
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
