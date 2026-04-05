// Access token lives in memory — intentionally lost on page refresh (security)
let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

export interface AuthResponse {
  accessToken: string
  user: { id: string; email: string; plan: string }
}

export interface SavedQR {
  id: string
  userId: string
  type: string
  label: string | null
  data: unknown
  fgColor: string | null
  bgColor: string | null
  createdAt: string
}

export interface PaymentCheckout {
  id: string
  pixPayload: string
  amount: string
  status: string
}

export interface PaymentStatus {
  id: string
  status: string
  amount: string
}

export interface DynamicQR {
  id: string
  userId: string
  shortCode: string
  redirectUrl: string
  label: string | null
  createdAt: string
  totalScans: number
}

async function apiFetch<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // On 401, try to silently refresh and retry once
  if (res.status === 401 && path !== '/auth/refresh' && path !== '/auth/login') {
    const refreshed = await tryRefresh()
    if (refreshed) {
      const retryHeaders: Record<string, string> = {
        'Authorization': `Bearer ${accessToken}`,
      }
      if (body !== undefined) retryHeaders['Content-Type'] = 'application/json'
      const retry = await fetch(`/api${path}`, {
        method,
        headers: retryHeaders,
        credentials: 'include',
        body: body !== undefined ? JSON.stringify(body) : undefined,
      })
      if (!retry.ok) {
        const err = await retry.json().catch(() => ({ error: 'Erro na requisição' }))
        throw new Error(err.error ?? 'Erro na requisição')
      }
      if (retry.status === 204) return undefined as T
      return retry.json()
    }
    throw new Error('Sessão expirada. Faça login novamente.')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro na requisição' }))
    throw new Error(err.error ?? 'Erro na requisição')
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
    if (!res.ok) return false
    const data: AuthResponse = await res.json()
    setAccessToken(data.accessToken)
    return true
  } catch {
    return false
  }
}

export const api = {
  auth: {
    register: (email: string, password: string) =>
      apiFetch<AuthResponse>('POST', '/auth/register', { email, password }),
    login: (email: string, password: string) =>
      apiFetch<AuthResponse>('POST', '/auth/login', { email, password }),
    refresh: () =>
      apiFetch<AuthResponse>('POST', '/auth/refresh'),
    logout: () =>
      apiFetch<{ ok: boolean }>('POST', '/auth/logout'),
  },
  qr: {
    save: (type: string, data: unknown, label?: string, fgColor?: string, bgColor?: string) =>
      apiFetch<SavedQR>('POST', '/qr/save', { type, data, label, fgColor, bgColor }),
    myCodes: () =>
      apiFetch<SavedQR[]>('GET', '/qr/my-codes'),
  },
  dynamic: {
    create: (redirectUrl: string, label?: string) =>
      apiFetch<DynamicQR>('POST', '/qr/dynamic', { redirectUrl, label }),
    list: () =>
      apiFetch<DynamicQR[]>('GET', '/qr/dynamic'),
    update: (id: string, data: { redirectUrl?: string; label?: string }) =>
      apiFetch<DynamicQR>('PATCH', `/qr/dynamic/${id}`, data),
    delete: (id: string) =>
      apiFetch<void>('DELETE', `/qr/dynamic/${id}`),
    stats: (id: string) =>
      apiFetch<{ totalScans: number }>('GET', `/qr/dynamic/${id}/stats`),
  },
  payments: {
    checkout: () =>
      apiFetch<PaymentCheckout>('POST', '/payments/checkout'),
    status: (id: string) =>
      apiFetch<PaymentStatus>('GET', `/payments/status/${id}`),
  },
}
