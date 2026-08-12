const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

export interface ApiErrorBody {
  error?: { code?: string; message?: string }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  })
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody
    throw new ApiError(response.status, body.error?.message ?? 'Something went wrong')
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T)
}
