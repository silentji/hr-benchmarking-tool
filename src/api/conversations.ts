import { api } from './client'
import type { ApiConversation, ApiConversationDetail, ApiMessage } from './types'

const ANALYSIS_TIMEOUT = 180000

export const conversationsApi = {
  list: () => api.get<ApiConversation[]>('/conversations').then((r) => r.data),

  create: () => api.post<ApiConversation>('/conversations', {}).then((r) => r.data),

  get: (conversationId: string) =>
    api.get<ApiConversationDetail>(`/conversations/${encodeURIComponent(conversationId)}`).then((r) => r.data),

  sendMessage: (conversationId: string, question: string) =>
    api
      .post<ApiMessage>(
        `/conversations/${encodeURIComponent(conversationId)}/messages`,
        { question },
        { timeout: ANALYSIS_TIMEOUT },
      )
      .then((r) => r.data),

  setSaved: (messageId: string, isSaved: boolean) =>
    api.patch<unknown>(`/messages/${encodeURIComponent(messageId)}`, { is_saved: isSaved }).then((r) => r.data),
}
