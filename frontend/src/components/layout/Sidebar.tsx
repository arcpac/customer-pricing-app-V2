import { ClipboardList, DollarSign, List, Search, Tag, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Page = 'pricing' | 'resolve' | 'profiles' | 'memberships' | 'resolved-prices';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  className?: string;
}

export function Sidebar({ activePage, onNavigate, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen w-56 flex flex-col bg-sidebar border-r border-sidebar-border shrink-0 z-10',
        className,
      )}
    >
      <div className="px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <DollarSign size={15} className="text-primary-foreground" />
          </span>
          <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
            Customer Pricing
          </span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <NavBtn
          active={activePage === 'pricing'}
          onClick={() => onNavigate('pricing')}
          icon={<Tag size={15} />}
        >
          Pricing
        </NavBtn>
        <NavBtn
          active={activePage === 'resolve'}
          onClick={() => onNavigate('resolve')}
          icon={<Search size={15} />}
        >
          Resolve Price
        </NavBtn>
        <NavBtn
          active={activePage === 'profiles'}
          onClick={() => onNavigate('profiles')}
          icon={<List size={15} />}
        >
          Pricing Profiles
        </NavBtn>
        <NavBtn
          active={activePage === 'memberships'}
          onClick={() => onNavigate('memberships')}
          icon={<Users size={15} />}
        >
          Group Memberships
        </NavBtn>
        <NavBtn
          active={activePage === 'resolved-prices'}
          onClick={() => onNavigate('resolved-prices')}
          icon={<ClipboardList size={15} />}
        >
          Resolved Prices
        </NavBtn>
      </nav>
    </aside>
  );
}

function NavBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
        active
          ? 'bg-white shadow-sm text-foreground font-semibold'
          : 'text-sidebar-foreground/70 font-medium hover:bg-white/60',
      )}
    >
      <span
        className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
          active
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted/60 text-muted-foreground',
        )}
      >
        {icon}
      </span>
      {children}
    </button>
  );
}
