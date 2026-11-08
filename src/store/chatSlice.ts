import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import {
  expandMessage,
  makeErrorAssistant,
  makePendingAssistant,
  makeUserMessage,
  normalizeMessagePair,
} from '../api/adapters'
import { getErrorMessage, getErrorStatus } from '../api/client'
import { conversationsApi } from '../api/conversations'
import type { AssistantChatMessage, ChatMessage, UserChatMessage } from '../types/chat'
import { createConversation, fetchConversations, touchConversation } from './conversationsSlice'

export interface FetchError {
  status: number | null
  message: string
}

export interface ChatEntry {
  messages: ChatMessage[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: FetchError | null
  sending: boolean
}

export interface ChatState {
  byId: Record<string, ChatEntry>
  draft: string
}

export interface SendQuestionArg {
  conversationId: string
  question: string
  retryPlaceholderId?: string
}

const emptyEntry = (): ChatEntry => ({ messages: [], status: 'idle', error: null, sending: false })

const userTempId = (requestId: string) => `local-${requestId}`
const placeholderId = (arg: SendQuestionArg, requestId: string) => arg.retryPlaceholderId ?? `pending-${requestId}`

export const fetchConversation = createAsyncThunk<
  { id: string; messages: ChatMessage[] },
  string,
  { rejectValue: FetchError }
>(
  'chat/fetchConversation',
  async (conversationId, { dispatch, rejectWithValue }) => {
    try {
      const data = await conversationsApi.get(conversationId)
      if (data.title) dispatch(touchConversation({ id: conversationId, title: data.title }))
      return { id: conversationId, messages: data.messages.flatMap(expandMessage) }
    } catch (e) {
      return rejectWithValue({ status: getErrorStatus(e), message: getErrorMessage(e) })
    }
  },
  {
    condition: (conversationId, { getState }) =>
      (getState() as { chat: ChatState }).chat.byId[conversationId]?.status !== 'loading',
  },
)

export const sendQuestion = createAsyncThunk<
  { user: UserChatMessage; assistant: AssistantChatMessage },
  SendQuestionArg,
  { rejectValue: string }
>('chat/sendQuestion', async ({ conversationId, question }, { dispatch, rejectWithValue }) => {
  try {
    const data = await conversationsApi.sendMessage(conversationId, question)
    const result = normalizeMessagePair(data)
    dispatch(touchConversation({ id: conversationId, fallbackTitle: question, updatedAt: new Date().toISOString() }))
    void dispatch(fetchConversations())
    return result
  } catch (e) {
    return rejectWithValue(getErrorMessage(e))
  }
})

export const askQuestion = createAsyncThunk<string, { conversationId?: string; question: string }>(
  'chat/askQuestion',
  async ({ conversationId, question }, { dispatch }) => {
    let id = conversationId
    if (!id) {
      const created = await dispatch(createConversation()).unwrap()
      id = created.id
    }
    void dispatch(sendQuestion({ conversationId: id, question }))
    return id
  },
)

interface ToggleSavedArg {
  conversationId: string
  messageId: string
  apiId: string
  isSaved: boolean
}

export const toggleSaved = createAsyncThunk<boolean, ToggleSavedArg, { rejectValue: string }>(
  'chat/toggleSaved',
  async ({ apiId, isSaved }, { rejectWithValue }) => {
    try {
      await conversationsApi.setSaved(apiId, isSaved)
      return isSaved
    } catch (e) {
      return rejectWithValue(getErrorMessage(e))
    }
  },
)

const setSavedFlag = (state: ChatState, { conversationId, messageId }: ToggleSavedArg, value: boolean) => {
  const m = state.byId[conversationId]?.messages.find((x) => x.id === messageId)
  if (m?.role === 'assistant') m.isSaved = value
}

const ensure = (state: ChatState, id: string): ChatEntry => (state.byId[id] ??= emptyEntry())

const initialState: ChatState = { byId: {}, draft: '' }

const slice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setDraft(state, { payload }: PayloadAction<string>) {
      state.draft = payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createConversation.fulfilled, (state, { payload }) => {
        state.byId[payload.id] = { ...emptyEntry(), status: 'succeeded' }
      })

      .addCase(fetchConversation.pending, (state, { meta }) => {
        const e = ensure(state, meta.arg)
        if (e.status !== 'succeeded') e.status = 'loading'
        e.error = null
      })
      .addCase(fetchConversation.fulfilled, (state, { payload }) => {
        const e = ensure(state, payload.id)
        if (!e.sending) e.messages = payload.messages
        e.status = 'succeeded'
      })
      .addCase(fetchConversation.rejected, (state, { meta, payload }) => {
        const e = ensure(state, meta.arg)
        e.status = 'failed'
        e.error = payload ?? { status: null, message: 'Ошибка загрузки' }
      })

      .addCase(sendQuestion.pending, (state, { meta }) => {
        const { conversationId, question, retryPlaceholderId } = meta.arg
        const e = ensure(state, conversationId)
        e.sending = true
        if (retryPlaceholderId) {
          const m = e.messages.find((x) => x.id === retryPlaceholderId)
          if (m?.role === 'assistant') {
            m.status = 'pending'
            m.detail = null
          }
          return
        }
        e.messages.push(makeUserMessage(userTempId(meta.requestId), question))
        e.messages.push(makePendingAssistant(placeholderId(meta.arg, meta.requestId), question))
      })
      .addCase(sendQuestion.fulfilled, (state, { meta, payload }) => {
        const e = ensure(state, meta.arg.conversationId)
        e.sending = false
        const pid = placeholderId(meta.arg, meta.requestId)
        const i = e.messages.findIndex((m) => m.id === pid)
        if (i >= 0) e.messages[i] = payload.assistant
        else e.messages.push(payload.assistant)
        const j = e.messages.findIndex((m) => m.id === userTempId(meta.requestId))
        if (j >= 0) e.messages[j] = payload.user
      })
      .addCase(sendQuestion.rejected, (state, { meta, payload, error }) => {
        const e = ensure(state, meta.arg.conversationId)
        e.sending = false
        const pid = placeholderId(meta.arg, meta.requestId)
        const failed = makeErrorAssistant(pid, meta.arg.question, payload ?? error.message ?? null)
        const i = e.messages.findIndex((m) => m.id === pid)
        if (i >= 0) e.messages[i] = failed
        else e.messages.push(failed)
      })

      .addCase(toggleSaved.pending, (state, { meta }) => setSavedFlag(state, meta.arg, meta.arg.isSaved))
      .addCase(toggleSaved.rejected, (state, { meta }) => setSavedFlag(state, meta.arg, !meta.arg.isSaved))
  },
})

export const { setDraft } = slice.actions
export const selectEntry = (state: { chat: ChatState }, id: string | undefined): ChatEntry | undefined =>
  id ? state.chat.byId[id] : undefined
export default slice.reducer
