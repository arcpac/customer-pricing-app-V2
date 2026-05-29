import { List, Search, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Page = 'pricing' | 'resolve' | 'profiles'

interface SidebarProps {
  activePage: Page
  onNavigate: (page: Page) => void
  className?: string
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
        <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
          Customer Pricing
        </span>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        <NavBtn active={activePage === 'pricing'} onClick={() => onNavigate('pricing')} icon={<Tag size={16} />}>
          Pricing
        </NavBtn>
        <NavBtn active={activePage === 'resolve'} onClick={() => onNavigate('resolve')} icon={<Search size={16} />}>
          Resolve Price
        </NavBtn>
        <NavBtn active={activePage === 'profiles'} onClick={() => onNavigate('profiles')} icon={<List size={16} />}>
          Pricing Profiles
        </NavBtn>
      </nav>
    </aside>
  )
}

function NavBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
      )}
    >
      {icon}
      {children}
    </button>
  )
}
