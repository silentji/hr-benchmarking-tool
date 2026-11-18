import type { ReactNode } from 'react'
import { useAppDispatch } from '../store/hooks'
import { toggleSidebar } from '../store/uiSlice'
import { MenuIcon } from './icons'
import styles from './PageHeader.module.css'

interface PageHeaderProps {
  title: string
  right?: ReactNode
}

export default function PageHeader({ title, right }: PageHeaderProps) {
  const dispatch = useAppDispatch()
  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.burger}
        aria-label="Открыть меню"
        onClick={() => dispatch(toggleSidebar())}
      >
        <MenuIcon />
      </button>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.right}>{right}</div>
    </header>
  )
}
