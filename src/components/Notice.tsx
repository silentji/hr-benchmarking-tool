import type { NoticeData } from '../types/chat'
import { cx } from '../utils/cx'
import { DatabaseIcon, WarningIcon } from './icons'
import styles from './Notice.module.css'

export default function Notice({ notice }: { notice: NoticeData }) {
  const warning = notice.kind === 'warning'
  return (
    <div className={cx(styles.notice, warning ? styles.warning : styles.info)} role={warning ? 'alert' : 'note'}>
      {warning ? <WarningIcon size={18} /> : <DatabaseIcon size={18} />}
      <span>{notice.text}</span>
    </div>
  )
}
