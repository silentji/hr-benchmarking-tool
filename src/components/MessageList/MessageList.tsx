import { useEffect, useRef } from 'react'
import styles from './MessageList.module.css'
import type { AssistantChatMessage, ChatMessage } from '../../types/chat'
import UserMessage from '../UserMessage/UserMessage'
import AssistantMessage from '../AssistantMessage/AssistantMessage'

interface MessageListProps {
  messages: ChatMessage[]
  busy: boolean
  onAsk: (question: string) => void
  onRetry: (message: AssistantChatMessage) => void
  onToggleSave: (message: AssistantChatMessage) => void
}

export default function MessageList({ messages, busy, onAsk, onRetry, onToggleSave }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null)
  const last = messages[messages.length - 1]
  const lastStatus = last?.role === 'assistant' ? last.status : null

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, lastStatus])

  return (
    <div className={styles.column}>
      {messages.map((m) => (
        <div key={m.id} className={styles.item}>
          {m.role === 'user' ? (
            <UserMessage message={m} />
          ) : (
            <AssistantMessage message={m} busy={busy} onAsk={onAsk} onRetry={onRetry} onToggleSave={onToggleSave} />
          )}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  )
}
