import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Sidebar } from '@/components/layout/Sidebar';
import type { Page } from '@/components/layout/Sidebar';
import { PricingPage } from '@/pages/PricingPage';
import { ResolvePage } from '@/pages/ResolvePage';
import { PricingProfilesPage } from '@/pages/PricingProfilesPage';
import { CustomerGroupMembershipsPage } from '@/pages/CustomerGroupMembershipsPage';
import { ResolvedPricesPage } from '@/pages/ResolvedPricesPage';
import { LoginPage } from '@/pages/LoginPage';
import { checkAuth, logout } from '@/api/auth';
import { Button } from '@/components/ui/button';

function App() {
  const [page, setPage] = useState<Page>('pricing');
  const [authed, setAuthed] = useState<boolean | null>(null);
  debugger;
  useEffect(() => {
    checkAuth().then(setAuthed);
  }, []);

  if (authed === null) return null;

  if (!authed) {
    return (
      <>
        <LoginPage onLogin={() => setAuthed(true)} />
        <Toaster />
      </>
    );
  }

  async function handleLogout() {
    await logout();
    setAuthed(false);
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar activePage={page} onNavigate={setPage} />
      <main className="flex-1 ml-56 overflow-auto p-6">
        <div className="mb-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
        {page === 'pricing' && <PricingPage />}
        {page === 'resolve' && <ResolvePage />}
        {page === 'profiles' && <PricingProfilesPage />}
        {page === 'memberships' && <CustomerGroupMembershipsPage />}
        {page === 'resolved-prices' && <ResolvedPricesPage />}
      </main>
      <Toaster />
    </div>
  );
}

export default App;
