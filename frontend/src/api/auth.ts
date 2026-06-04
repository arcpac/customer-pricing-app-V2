const BASE = 'http://localhost:4000'

export async function checkAuth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/api/auth/me`, { credentials: 'include' })
    return res.ok
  } catch {
    return false
  }
}

export async function logout(): Promise<void> {
  await fetch(`${BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' })
}
