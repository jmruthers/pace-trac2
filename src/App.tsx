import { ErrorBoundaryProvider, ToastProvider } from '@solvera/pace-core/components';
import { AppRoutes } from '@/app/routes/app-routes';

export function App() {
  return (
    <ErrorBoundaryProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </ErrorBoundaryProvider>
  );
}
