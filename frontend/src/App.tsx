import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Sidebar } from '@/components/layout/Sidebar';
import type { Page } from '@/components/layout/Sidebar';
import { PricingPage } from '@/pages/PricingPage';
import { ResolvePage } from '@/pages/ResolvePage';
import { PricingProfilesPage } from '@/pages/PricingProfilesPage';
import { CustomerGroupMembershipsPage } from '@/pages/CustomerGroupMembershipsPage';
import { ResolvedPricesListPage } from '@/pages/ResolvedPricesPage';
import { ResolvedPriceDetailPage } from '@/pages/ResolvedPriceDetailPage';
import { LoginPage } from '@/pages/LoginPage';
import { SetPasswordPage } from '@/pages/SetPasswordPage';
import { UsersPage } from '@/pages/admin/UsersPage';
import { ProductsManagePage } from '@/pages/admin/ProductsManagePage';
import { CustomersManagePage } from '@/pages/admin/CustomersManagePage';
import { CustomerGroupsManagePage } from '@/pages/admin/CustomerGroupsManagePage';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

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
  const isResolvedDetail = pathname.startsWith('/resolved-prices/');
  const page: Page = PATH_TO_PAGE[pathname] ?? (isResolvedDetail ? 'resolved-prices' : 'pricing');
  const { user, isAuthenticated, isLoading, init, logout } = useAuthStore();
  const tokenParams = getTokenParams();

  useEffect(() => {
    void init();
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

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-foreground">
      <Sidebar activePage={page} onNavigate={(p) => navigate(PAGE_TO_PATH[p])} role={user!.role} />
      <main className="flex-1 ml-56 overflow-auto p-6">
        <div className="mb-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => void logout()}>
            Logout
          </Button>
        </div>
        {page === 'pricing' && <PricingPage />}
        {page === 'resolve' && <ResolvePage />}
        {page === 'profiles' && <PricingProfilesPage />}
        {page === 'memberships' && <CustomerGroupMembershipsPage />}
        {page === 'resolved-prices' && (
          isResolvedDetail
            ? <ResolvedPriceDetailPage customerId={pathname.split('/')[2] ?? ''} />
            : <ResolvedPricesListPage />
        )}
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
