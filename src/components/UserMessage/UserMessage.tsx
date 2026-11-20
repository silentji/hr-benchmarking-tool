import type { UserChatMessage } from '../../types/chat'
import styles from './UserMessage.module.css'

export default function UserMessage({ message }: { message: UserChatMessage }) {
  return (
    <div className={styles.row}>
      <div className={styles.bubble}>{message.text}</div>
    </div>
  )
}
