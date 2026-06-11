import { ErrorBoundary, ToastProvider } from '@solvera/pace-core/components';
import { AppRoutes } from '@/app/routes/app-routes';

export function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </ErrorBoundary>
  );
}
