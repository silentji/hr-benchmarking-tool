import type { ReactNode } from 'react'
import styles from './StateMessage.module.css'
import { cx } from '../../utils/cx'

interface StateMessageProps {
  /** Вертикальная раскладка с заголовком и действием; без неё — строка со спиннером. */
  column?: boolean
  children: ReactNode
}

export default function StateMessage({ column = false, children }: StateMessageProps) {
  return (
    <div className={cx(styles.center, column && styles.column)} role={column ? undefined : 'status'}>
      {children}
    </div>
  )
}

export function Spinner() {
  return <span className={styles.spinner} aria-hidden="true" />
}

export function StateTitle({ children }: { children: ReactNode }) {
  return <h2 className={styles.title}>{children}</h2>
}
