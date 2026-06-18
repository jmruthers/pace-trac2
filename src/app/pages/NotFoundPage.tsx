import { useNavigate } from 'react-router-dom';
import { Button } from '@solvera/pace-core/components';
import { TRAC_AUTHENTICATED_HOME_PATH } from '@/app/routes/route-redirects';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <section className="grid place-items-center gap-4 p-6 text-center">
      <span aria-hidden>404</span>
      <h1>Page not found</h1>
      <p>The address does not match any pace-trac screen.</p>
      <Button
        type="button"
        variant="default"
        onClick={() => navigate(TRAC_AUTHENTICATED_HOME_PATH)}
      >
        Back to events
      </Button>
    </section>
  );
}
