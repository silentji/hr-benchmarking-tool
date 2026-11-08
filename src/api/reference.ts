import { api } from './client'

// TODO состакать схемы ответов и убрать unknown
export const referenceApi = {
  enterprises: () => api.get<unknown>('/enterprises').then((r) => r.data),

  departments: (enterpriseId: string) =>
    api.get<unknown>(`/enterprises/${encodeURIComponent(enterpriseId)}/departments`).then((r) => r.data),

  metrics: () => api.get<unknown>('/metrics').then((r) => r.data),

  tables: () => api.get<unknown>('/data/tables').then((r) => r.data),

  tableRows: (tableName: string, { page = 1, pageSize = 50 } = {}) =>
    api
      .get<unknown>(`/data/tables/${encodeURIComponent(tableName)}/rows`, {
        params: { page, page_size: pageSize },
      })
      .then((r) => r.data),

  exportTable: (tableName: string, format: 'csv' | 'xlsx' = 'csv') =>
    api
      .get<Blob>(`/data/tables/${encodeURIComponent(tableName)}/export`, {
        params: { format },
        responseType: 'blob',
        timeout: 120000,
      })
      .then((r) => r.data),
}
