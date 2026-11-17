import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';

import AppTabs from '@/components/app-tabs';
import { auth } from '@/config/firebase';

export default function TabsLayout() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    auth.authStateReady().then(() => setAuthReady(true));
  }, []);

  if (!authReady) return null;

  // Not signed in -> send to the welcome / login / sign-up flow
  if (!auth.currentUser) return <Redirect href="/welcome" />;

  return <AppTabs />;
}
