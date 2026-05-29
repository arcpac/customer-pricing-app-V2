import { LayoutList, Package, Plus, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export type View = 'products' | 'profiles' | 'customers' | 'create'

interface NavItem {
  label: string
  view: View
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Products', view: 'products', icon: <Package size={16} /> },
  { label: 'Pricing Profiles', view: 'profiles', icon: <LayoutList size={16} /> },
  { label: 'Customers', view: 'customers', icon: <Users size={16} /> },
  { label: 'Create Profile', view: 'create', icon: <Plus size={16} /> },
]

interface SidebarProps {
  activeView: View
  onNavigate: (view: View) => void
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-56 flex flex-col border-r bg-white border-sidebar-border shrink-0 z-10">
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map(({ label, view, icon }) => (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium bg-white transition-colors',
              activeView === view
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
            )}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>

      <footer className="p-4 border-t border-sidebar-border">
        <span className="text-xs font-semibold text-sidebar-foreground/60 tracking-wide uppercase">
          Customer Pricing
        </span>
      </footer>
    </aside>
  )
}
