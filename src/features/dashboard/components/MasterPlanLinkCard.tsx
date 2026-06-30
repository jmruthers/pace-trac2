import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@solvera/pace-core/components';
import { usePageCan } from '@solvera/pace-core/rbac';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';

export function MasterPlanLinkCard() {
  const { can: canReadMasterPlan, isLoading } = usePageCan(TRAC_PAGE_NAMES.masterplan, 'read');

  if (isLoading || !canReadMasterPlan) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Master plan</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Printable operational summary with journey map, contacts, costs, and full itinerary.</p>
        <fieldset className="text-right">
          <Link to="/masterplan">Open master plan</Link>
        </fieldset>
      </CardContent>
    </Card>
  );
}
