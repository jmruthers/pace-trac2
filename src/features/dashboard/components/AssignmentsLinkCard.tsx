import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@solvera/pace-core/components';

export function AssignmentsLinkCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignments</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Manage participant assignments for transport, accommodation, and activities.</p>
        <fieldset className="text-right">
          <Link to="/assignments">Open assignments</Link>
        </fieldset>
      </CardContent>
    </Card>
  );
}
