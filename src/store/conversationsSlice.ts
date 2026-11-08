import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { normalizeConversation } from '../api/adapters'
import { getErrorMessage } from '../api/client'
import { conversationsApi } from '../api/conversations'
import type { Conversation } from '../types/chat'

export interface ConversationsState {
  items: Conversation[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  query: string
}

const truncate = (s: string, n = 60) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s)

export const fetchConversations = createAsyncThunk<Conversation[], void, { rejectValue: string }>(
  'conversations/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const data = await conversationsApi.list()
      return data.map(normalizeConversation)
    } catch (e) {
      return rejectWithValue(getErrorMessage(e))
    }
  },
)

export const createConversation = createAsyncThunk<Conversation, void, { rejectValue: string }>(
  'conversations/create',
  async (_, { rejectWithValue }) => {
    try {
      return normalizeConversation(await conversationsApi.create())
    } catch (e) {
      return rejectWithValue(getErrorMessage(e))
    }
  },
)

interface TouchPayload {
  id: string
  title?: string
  fallbackTitle?: string
  updatedAt?: string
}

const initialState: ConversationsState = { items: [], status: 'idle', error: null, query: '' }

const slice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    setQuery(state, { payload }: PayloadAction<string>) {
      state.query = payload
    },
    touchConversation(state, { payload }: PayloadAction<TouchPayload>) {
      const c = state.items.find((i) => i.id === payload.id)
      if (!c) return
      if (payload.title) c.title = payload.title
      else if (!c.title && payload.fallbackTitle) c.title = truncate(payload.fallbackTitle)
      if (payload.updatedAt) c.updatedAt = payload.updatedAt
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        if (state.status !== 'succeeded') state.status = 'loading'
        state.error = null
      })
      .addCase(fetchConversations.fulfilled, (state, { payload }) => {
        const local = new Map(state.items.map((c) => [c.id, c]))
        const remoteIds = new Set(payload.map((c) => c.id))
        const merged = payload.map((c) => ({ ...c, title: c.title || local.get(c.id)?.title || '' }))
        const keep = state.items.filter((c) => c.isNew && !remoteIds.has(c.id))
        state.items = [...keep, ...merged]
        state.status = 'succeeded'
      })
      .addCase(fetchConversations.rejected, (state, { payload }) => {
        state.status = 'failed'
        state.error = payload ?? 'Ошибка загрузки'
      })
      .addCase(createConversation.fulfilled, (state, { payload }) => {
        state.items.unshift({ ...payload, isNew: true, updatedAt: payload.updatedAt ?? new Date().toISOString() })
      })
  },
})

export const { setQuery, touchConversation } = slice.actions
export default slice.reducer
