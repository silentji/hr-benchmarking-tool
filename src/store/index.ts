import { configureStore } from '@reduxjs/toolkit'
import chat from './chatSlice'
import conversations from './conversationsSlice'
import ui from './uiSlice'

export const store = configureStore({
  reducer: { conversations, chat, ui },
})

export type AppStore = typeof store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
