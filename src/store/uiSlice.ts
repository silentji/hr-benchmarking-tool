import { createSlice } from '@reduxjs/toolkit'

interface UiState {
  sidebarOpen: boolean
}

const initialState: UiState = { sidebarOpen: false }

const slice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
    closeSidebar(state) {
      state.sidebarOpen = false
    },
  },
})

export const { toggleSidebar, closeSidebar } = slice.actions
export default slice.reducer
