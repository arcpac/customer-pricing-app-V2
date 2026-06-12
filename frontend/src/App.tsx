import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Sidebar } from '@/components/layout/Sidebar';
import type { Page } from '@/components/layout/Sidebar';
import { PricingPage } from '@/pages/PricingPage';
import { ResolvePage } from '@/pages/ResolvePage';
import { PricingProfilesPage } from '@/pages/PricingProfilesPage';
import { CustomerGroupMembershipsPage } from '@/pages/CustomerGroupMembershipsPage';
import { ResolvedPricesPage } from '@/pages/ResolvedPricesPage';
import { LoginPage } from '@/pages/LoginPage';
import { SetPasswordPage } from '@/pages/SetPasswordPage';
import { UsersPage } from '@/pages/admin/UsersPage';
import { ProductsManagePage } from '@/pages/admin/ProductsManagePage';
import { CustomersManagePage } from '@/pages/admin/CustomersManagePage';
import { CustomerGroupsManagePage } from '@/pages/admin/CustomerGroupsManagePage';
import { checkAuth, logout } from '@/api/auth';
import { Button } from '@/components/ui/button';
import type { Role } from '@/types';

const PAGE_TO_PATH: Record<Page, string> = {
  pricing: '/',
  resolve: '/resolve',
  profiles: '/profiles',
  memberships: '/memberships',
  'resolved-prices': '/resolved-prices',
  'admin-users': '/admin/users',
  'admin-products': '/admin/products',
  'admin-customers': '/admin/customers',
  'admin-groups': '/admin/groups',
};

const PATH_TO_PAGE: Record<string, Page> = Object.fromEntries(
  Object.entries(PAGE_TO_PATH).map(([page, path]) => [path, page as Page]),
);

function getTokenParams(): { token: string; type: 'invite' | 'reset' } | null {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const type = params.get('type');
  if (token && (type === 'invite' || type === 'reset')) {
    return { token, type };
  }
  return null;
}

function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const page: Page = PATH_TO_PAGE[pathname] ?? 'pricing';
  const [role, setRole] = useState<Role | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const tokenParams = getTokenParams();

  useEffect(() => {
    checkAuth().then((result) => {
      if (result) {
        setRole(result.role);
        setAuthed(true);
      } else {
        setAuthed(false);
      }
    });
  }, []);

  if (tokenParams) {
    return (
      <>
        <SetPasswordPage
          token={tokenParams.token}
          type={tokenParams.type}
          onDone={() => {
            window.history.replaceState({}, '', '/');
          }}
        />
        <Toaster />
      </>
    );
  }

  if (authed === null) return null;

  if (!authed) {
    return (
      <>
        <LoginPage
          onLogin={(newRole: Role) => {
            setRole(newRole);
            setAuthed(true);
          }}
        />
        <Toaster />
      </>
    );
  }

  async function handleLogout() {
    await logout();
    setAuthed(false);
    setRole(null);
  }

  return (
    <div className="flex h-screen bg-slate-50 text-foreground">
      <Sidebar activePage={page} onNavigate={(p) => navigate(PAGE_TO_PATH[p])} role={role!} />
      <main className="flex-1 ml-56 overflow-auto p-6">
        <div className="mb-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => void handleLogout()}>
            Logout
          </Button>
        </div>
        {page === 'pricing' && <PricingPage />}
        {page === 'resolve' && <ResolvePage />}
        {page === 'profiles' && <PricingProfilesPage />}
        {page === 'memberships' && <CustomerGroupMembershipsPage />}
        {page === 'resolved-prices' && <ResolvedPricesPage />}
        {page === 'admin-users' && <UsersPage />}
        {page === 'admin-products' && <ProductsManagePage />}
        {page === 'admin-customers' && <CustomersManagePage />}
        {page === 'admin-groups' && <CustomerGroupsManagePage />}
      </main>
      <Toaster />
    </div>
  );
}

export default App;
