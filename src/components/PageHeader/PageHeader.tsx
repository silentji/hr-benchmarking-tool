import type { ReactNode } from 'react'
import styles from './PageHeader.module.css'
import { useAppDispatch } from '../../store/hooks'
import { toggleSidebar } from '../../store/uiSlice'
import { MenuIcon } from '../icons'

interface PageHeaderProps {
  title: string
  right?: ReactNode
}

const isMock = import.meta.env.VITE_USE_MOCKS === 'true'

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
      {isMock && <div className={styles.mock}>Демо-режим: моковые данные</div>}
      <div className={styles.right}>{right}</div>
    </header>
  )
}
