import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { Sidebar, type View } from '@/components/Sidebar'

const VIEW_LABELS: Record<View, string> = {
  products: 'Products',
  profiles: 'Pricing Profiles',
  customers: 'Customers',
  create: 'Create Profile',
}

function App() {
  const [activeView, setActiveView] = useState<View>('products')

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      <main className="flex-1 ml-56 overflow-auto p-6">
        <h2 className="text-lg font-semibold mb-4">{VIEW_LABELS[activeView]}</h2>
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
          {VIEW_LABELS[activeView]} — coming in Phase 3 / 4
        </div>
      </main>

      <Toaster />
    </div>
  )
}

export default App
