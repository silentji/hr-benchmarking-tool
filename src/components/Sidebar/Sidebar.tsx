import { NavLink, useNavigate } from 'react-router-dom'
import { setDraft } from '../../store/chatSlice'
import { setQuery } from '../../store/conversationsSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { closeSidebar } from '../../store/uiSlice'
import { cx } from '../../utils/cx'
import { BarChartIcon, DatabaseIcon, PlusIcon } from '../icons'
import styles from './Sidebar.module.css'
import SearchInput from '../SearchInput/SearchInput'
import HistoryList from '../HistoryList/HistoryList'

export default function Sidebar() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const open = useAppSelector((s) => s.ui.sidebarOpen)

  const newDialog = () => {
    dispatch(setDraft(''))
    dispatch(setQuery(''))
    dispatch(closeSidebar())
    void navigate('/')
  }

  const navClass = ({ isActive }: { isActive: boolean }) => cx(styles.navLink, isActive && styles.active)

  return (
    <aside className={cx(styles.sidebar, open && styles.open)}>
      <div className={styles.brand}>Бенчмаркинг HR‑показателей</div>

      <button type="button" className={styles.newButton} onClick={newDialog}>
        <PlusIcon size={18} />
        Новый диалог
      </button>

      <SearchInput />

      <HistoryList />
      <div className={styles.navLinks}>
        <NavLink to="/data" className={navClass}>
          <DatabaseIcon />
          Данные
        </NavLink>
        <NavLink to="/dashboards" className={navClass}>
          <BarChartIcon />
          Дашборды
        </NavLink>
        <div className={styles.caption}>Анализ агрегированных данных</div>
      </div>
      <button type="button" className={styles.account} title="Аккаунт" aria-label="Аккаунт">
        <span className={styles.avatar}>HR</span>
        <span className={styles.accountName}>Аккаунт</span>
      </button>
    </aside>
  )
}
