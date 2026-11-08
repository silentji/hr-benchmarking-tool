import axios, { isAxiosError } from 'axios'
import { getToken } from './auth'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

if (import.meta.env.VITE_USE_MOCKS === 'true') {
  api.defaults.adapter = (config) => import('../mocks/adapter').then((m) => m.mockAdapter(config))
}

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export function getErrorStatus(error: unknown): number | null {
  return isAxiosError(error) ? (error.response?.status ?? null) : null
}

export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data: unknown = error.response?.data
    if (data && typeof data === 'object') {
      const { detail, message } = data as { detail?: unknown; message?: unknown }
      if (typeof detail === 'string') return detail
      if (typeof message === 'string') return message
    }
    if (error.code === 'ECONNABORTED') return 'Превышено время ожидания ответа'
    if (!error.response) return 'Нет связи с сервером'
    return `Ошибка сервера (${error.response.status})`
  }
  return error instanceof Error ? error.message : 'Неизвестная ошибка'
}
