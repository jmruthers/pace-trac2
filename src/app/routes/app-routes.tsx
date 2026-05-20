import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute, PaceLoginPage, LoadingSpinner } from '@solvera/pace-core/components';
import { APP_NAME } from '@/app-config';
import { resolveUserDashboardRedirectTarget } from '@/app/routes/route-redirects';
import { AuthenticatedRoutes } from '@/app/routes/authenticated-routes';

export function AppRoutes() {
  const homePath = resolveUserDashboardRedirectTarget();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PaceLoginPage appName={APP_NAME} onSuccessRedirectPath={homePath} />
        }
      />
      <Route
        element={
          <ProtectedRoute loginPath="/login" loadingFallback={<LoadingSpinner />} />
        }
      >
        <Route path="/*" element={<AuthenticatedRoutes />} />
      </Route>
    </Routes>
  );
}
