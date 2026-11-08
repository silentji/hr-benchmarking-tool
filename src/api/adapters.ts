import type {
  AssistantChatMessage,
  ChatMessage,
  Conversation,
  MessageAction,
  TableData,
  UserChatMessage,
} from '../types/chat'
import type {
  ApiAction,
  ApiAnalysis,
  ApiConversation,
  ApiMessage,
  ApiTable,
} from './types'

export function normalizeConversation(raw: ApiConversation): Conversation {
  return {
    id: String(raw.id),
    title: (raw.title ?? '').trim(),
    updatedAt: raw.updated_at ?? raw.created_at ?? null,
    isNew: false,
  }
}

function buildMeta(ctx: ApiAnalysis['context']): string {
  if (!ctx) return ''
  return [ctx.period, ctx.enterprises?.join(', ')].filter(Boolean).join(' · ')
}

function normalizeAction(a: ApiAction): MessageAction | null {
  if (!a.label) return null
  if (a.type === 'navigate') return a.to ? { type: 'navigate', label: a.label, to: a.to } : null
  return { type: 'ask', label: a.label, question: a.question ?? a.label }
}

function normalizeTable(t: ApiTable | undefined): TableData | null {
  if (!t || t.columns.length === 0) return null
  return {
    columns: t.columns.map((c) => ({ key: c.key, label: c.label, align: c.align, accent: Boolean(c.accent) })),
    rows: t.rows.map((r, i) => ({ id: i, cells: r.cells, highlight: Boolean(r.highlight) })),
  }
}

function baseAssistant(id: string, status: AssistantChatMessage['status']): AssistantChatMessage {
  return {
    id,
    apiId: null,
    role: 'assistant',
    status,
    meta: '',
    title: null,
    text: '',
    table: null,
    notice: null,
    actions: [],
    isSaved: false,
    question: null,
    detail: null,
    createdAt: null,
  }
}

export function makePendingAssistant(id: string, question: string): AssistantChatMessage {
  return { ...baseAssistant(id, 'pending'), question }
}

export function makeErrorAssistant(id: string, question: string, detail: string | null): AssistantChatMessage {
  return { ...baseAssistant(id, 'error'), question, detail }
}

export function makeUserMessage(id: string, text: string, createdAt: string | null = null): UserChatMessage {
  return { id, role: 'user', text, createdAt }
}

function makeAssistant(raw: ApiMessage): AssistantChatMessage {
  const a = raw.analysis
  const apiId = String(raw.id)
  if (!a || a.status === 'error') {
    return { ...makeErrorAssistant(apiId, raw.question, null), apiId, createdAt: raw.created_at ?? null }
  }
  return {
    ...baseAssistant(apiId, a.status === 'insufficient_data' ? 'insufficient_data' : 'ok'),
    apiId,
    meta: buildMeta(a.context),
    title: a.title ?? null,
    text: a.text ?? '',
    table: normalizeTable(a.table),
    notice: a.notice ? { kind: a.notice.kind, text: a.notice.text } : null,
    actions: (a.actions ?? []).map(normalizeAction).filter((x): x is MessageAction => x !== null),
    isSaved: Boolean(raw.is_saved),
    question: raw.question,
    createdAt: raw.created_at ?? null,
  }
}

export function normalizeMessagePair(raw: ApiMessage): { user: UserChatMessage; assistant: AssistantChatMessage } {
  return {
    user: makeUserMessage(`${raw.id}:q`, raw.question, raw.created_at ?? null),
    assistant: makeAssistant(raw),
  }
}

export function expandMessage(raw: ApiMessage): ChatMessage[] {
  const { user, assistant } = normalizeMessagePair(raw)
  return [user, assistant]
}
