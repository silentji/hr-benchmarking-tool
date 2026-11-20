import type { ReactNode } from 'react'
import styles from './ScrollArea.module.css'

export default function ScrollArea({ children }: { children: ReactNode }) {
  return <div className={styles.scroll}>{children}</div>
}
