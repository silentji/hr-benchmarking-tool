import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import styles from './App.module.css'
import Sidebar from './components/Sidebar'
import { BarChartIcon, DatabaseIcon } from './components/icons'
import ChatPage from './pages/ChatPage'
import StubPage from './pages/StubPage'
import { fetchConversations } from './store/conversationsSlice'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { closeSidebar } from './store/uiSlice'

export default function App() {
  const dispatch = useAppDispatch()
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen)
  const { pathname } = useLocation()

  useEffect(() => {
    void dispatch(fetchConversations())
  }, [dispatch])

  useEffect(() => {
    dispatch(closeSidebar())
  }, [pathname, dispatch])

  // TODO настроить работу авторизации
  useEffect(() => {
    const onUnauthorized = () => console.warn('Требуется авторизация')
    window.addEventListener('auth:unauthorized', onUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized)
  }, [])

  return (
    <div className={styles.layout}>
      <Sidebar />
      {sidebarOpen && <div className={styles.scrim} onClick={() => dispatch(closeSidebar())} />}
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/c/:conversationId" element={<ChatPage />} />
          <Route path="/data" element={<StubPage title="Данные" icon={<DatabaseIcon size={32} />} />} />
          <Route path="/dashboards" element={<StubPage title="Дашборды" icon={<BarChartIcon size={32} />} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
