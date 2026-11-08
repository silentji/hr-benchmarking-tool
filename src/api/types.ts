export type ApiCellValue = string | number | null

export interface ApiTableColumn {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
  accent?: boolean
}

export interface ApiTableRow {
  cells: Record<string, ApiCellValue>
  highlight?: boolean
}

export interface ApiTable {
  columns: ApiTableColumn[]
  rows: ApiTableRow[]
}

export interface ApiAction {
  type: 'ask' | 'navigate'
  label: string
  question?: string
  to?: string
}

export interface ApiAnalysis {
  status?: 'ok' | 'insufficient_data' | 'error'
  context?: { period?: string; enterprises?: string[] }
  title?: string
  text?: string
  table?: ApiTable
  notice?: { kind: 'info' | 'warning'; text: string }
  actions?: ApiAction[]
}

export interface ApiMessage {
  id: string | number
  question: string
  analysis?: ApiAnalysis
  is_saved?: boolean
  created_at?: string
}

export interface ApiConversation {
  id: string | number
  title?: string
  created_at?: string
  updated_at?: string
}

export interface ApiConversationDetail extends ApiConversation {
  messages: ApiMessage[]
}
