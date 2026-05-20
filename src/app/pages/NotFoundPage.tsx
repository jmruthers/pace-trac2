import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from '@solvera/pace-core/components';
import { TRAC_AUTHENTICATED_HOME_PATH } from '@/app/routes/route-redirects';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <section className="grid place-items-center p-6">
      <Card>
        <CardHeader>
          <CardTitle>Page not found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The page you requested does not exist or is not available yet.</p>
        </CardContent>
        <CardFooter className="text-right">
          <Button
            type="button"
            variant="default"
            onClick={() => navigate(TRAC_AUTHENTICATED_HOME_PATH)}
          >
            Go to home
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
