import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import styles from './HistoryList.module.css'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { groupConversations } from '../../utils/groupConversations'
import { fetchConversations } from '../../store/conversationsSlice'
import { cx } from '../../utils/cx'

export default function HistoryList() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((s) => s.conversations.items)
  const status = useAppSelector((s) => s.conversations.status)
  const query = useAppSelector((s) => s.conversations.query)
  const groups = useMemo(() => groupConversations(items, query), [items, query])

  if (status === 'loading' && items.length === 0) {
    return (
      <div className={styles.history} aria-busy="true">
        {[70, 55, 80].map((w) => (
          <div key={w} className={styles.skeleton} style={{ width: `${w}%` }} />
        ))}
      </div>
    )
  }

  if (status === 'failed' && items.length === 0) {
    return (
      <div className={cx(styles.history, styles.empty)}>
        <p>Не удалось загрузить историю</p>
        <button type="button" className={styles.retry} onClick={() => void dispatch(fetchConversations())}>
          Повторить
        </button>
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className={cx(styles.history, styles.empty)}>
        <p>{query.trim() ? 'Ничего не найдено' : 'Диалогов пока нет'}</p>
      </div>
    )
  }

  return (
    <nav className={styles.history} aria-label="История диалогов">
      {groups.map((group) => (
        <section key={group.key} className={styles.group}>
          <h2 className={styles.label}>{group.label}</h2>
          {group.items.map((c) => (
            <NavLink
              key={c.id}
              to={`/c/${c.id}`}
              className={({ isActive }) => cx(styles.item, isActive && styles.active)}
              title={c.title || 'Новый диалог'}
            >
              <span>{c.title || 'Новый диалог'}</span>
            </NavLink>
          ))}
        </section>
      ))}
    </nav>
  )
}
