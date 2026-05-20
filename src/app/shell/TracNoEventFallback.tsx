/** Route-level fallback only — not a permission-gated page (see TR01). */
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle, Card, CardContent, CardHeader, CardTitle } from '@solvera/pace-core/components';
import { TRAC_AUTHENTICATED_HOME_PATH } from '@/app/routes/route-redirects';

export function TracNoEventFallback() {
  return (
    <section className="grid place-items-center p-6">
      <Card>
        <CardHeader>
          <CardTitle>Select an event</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Alert variant="default">
            <AlertTitle>Event required</AlertTitle>
            <AlertDescription>
              Choose an event from the header selector to continue in TRAC.
            </AlertDescription>
          </Alert>
          <p>
            <Link to={TRAC_AUTHENTICATED_HOME_PATH}>Return to home</Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
