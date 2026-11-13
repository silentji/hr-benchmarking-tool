import { AxiosError } from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { handleMockRequest } from './handlers'

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export async function mockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  let body: unknown = config.data
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch { }
  }

  const result = handleMockRequest({
    method: (config.method ?? 'get').toUpperCase(),
    path: config.url ?? '',
    body,
  })
  await sleep(result.delay)

  const response: AxiosResponse = {
    data: result.data,
    status: result.status,
    statusText: result.status < 400 ? 'OK' : 'Error',
    headers: {},
    config,
    request: {},
  }
  if (result.status >= 200 && result.status < 300) return response

  throw new AxiosError(
    `Request failed with status code ${result.status}`,
    result.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
    config,
    null,
    response,
  )
}
