export type CellValue = string | number | null

export interface TableColumn {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
  accent?: boolean
}

export interface TableRow {
  id: string | number
  cells: Record<string, CellValue>
  highlight: boolean
}

export interface TableData {
  columns: TableColumn[]
  rows: TableRow[]
}

export interface ChartSeries {
  key: string
  label: string
}

export interface ChartCategory {
  label: string
  values: Record<string, number | null>
}

export interface ChartData {
  title: string | null
  unit: string
  series: ChartSeries[]
  categories: ChartCategory[]
}

export interface NoticeData {
  kind: 'info' | 'warning'
  text: string
}

export type MessageAction =
  | { type: 'ask'; label: string; question: string }
  | { type: 'navigate'; label: string; to: string }

export interface UserChatMessage {
  id: string
  role: 'user'
  text: string
  createdAt: string | null
}

export type AssistantStatus = 'ok' | 'insufficient_data' | 'error' | 'pending'

export interface AssistantChatMessage {
  id: string
  apiId: string | null
  role: 'assistant'
  status: AssistantStatus
  meta: string
  title: string | null
  text: string
  table: TableData | null
  chart: ChartData | null
  notice: NoticeData | null
  actions: MessageAction[]
  isSaved: boolean
  question: string | null
  detail: string | null
  createdAt: string | null
}

export type ChatMessage = UserChatMessage | AssistantChatMessage

export interface Conversation {
  id: string
  title: string
  updatedAt: string | null
  isNew: boolean
}
