import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { Sidebar } from '@/components/layout/Sidebar'
import type { Page } from '@/components/layout/Sidebar'
import { PricingPage } from '@/pages/PricingPage'
import { ResolvePage } from '@/pages/ResolvePage'
import { PricingProfilesPage } from '@/pages/PricingProfilesPage'

function App() {
  const [page, setPage] = useState<Page>('pricing')

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar activePage={page} onNavigate={setPage} />
      <main className="flex-1 ml-56 overflow-auto p-6">
        {page === 'pricing' && <PricingPage />}
        {page === 'resolve' && <ResolvePage />}
        {page === 'profiles' && <PricingProfilesPage />}
      </main>
      <Toaster />
    </div>
  )
}

export default App
