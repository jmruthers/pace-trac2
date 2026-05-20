/**
 * Org/event/inactivity providers inside UnifiedAuthProvider (pace-core2 shell contract).
 */
import {
  OrganisationServiceProvider,
  EventServiceProvider,
  InactivityServiceProvider,
} from '@solvera/pace-core/providers';
import { useUnifiedAuthContext } from '@solvera/pace-core';
import { App } from './App';

function AppWithOrgAndEvent() {
  const { user, session, supabase } = useUnifiedAuthContext();
  return (
    <OrganisationServiceProvider supabaseClient={supabase} user={user} session={session}>
      <EventServiceProvider supabaseClient={supabase}>
        <App />
      </EventServiceProvider>
    </OrganisationServiceProvider>
  );
}

export function AppWithProviders() {
  return (
    <InactivityServiceProvider>
      <AppWithOrgAndEvent />
    </InactivityServiceProvider>
  );
}
