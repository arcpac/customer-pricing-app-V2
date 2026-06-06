import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const BASE = import.meta.env.VITE_API_URL ?? '';

interface Props {
  onLogin: () => void
}

export function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(body.error ?? 'Login failed')
      }
      onLogin()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="grid h-screen grid-cols-12"
      style={{ background: 'linear-gradient(135deg, #DCEAFF 0%, #147D73 100%)' }}
    >
      <div className="col-span-4 flex flex-col justify-center px-10 bg-white/10 backdrop-blur-md border-r border-white/20">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="text-xl font-semibold">Sign in</h1>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              className='bg-white'
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@foboh.com"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              className='bg-white'
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
      <div className="col-span-8" />
    </div>
  )
}
