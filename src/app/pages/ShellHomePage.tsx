import { Card, CardContent, CardHeader, CardTitle } from '@solvera/pace-core/components';

/** SLICE-01 placeholder for `/` until SLICE-02 dashboard ships. */
export function ShellHomePage() {
  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>TRAC</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Platform shell is ready. Dashboard and feature routes will appear as their slices ship.</p>
        </CardContent>
      </Card>
    </section>
  );
}
