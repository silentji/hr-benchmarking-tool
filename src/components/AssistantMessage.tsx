import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AssistantChatMessage, MessageAction } from '../types/chat'
import { copyText } from '../utils/clipboard'
import { cx } from '../utils/cx'
import AnalysisTable from './AnalysisTable'
import Button from './Button'
import Notice from './Notice'
import {
  BookmarkIcon,
  CheckIcon,
  ChevronRightIcon,
  CopyIcon,
  DatabaseIcon,
  RefreshIcon,
  SparkleIcon,
} from './icons'
import styles from './AssistantMessage.module.css'

function toPlainText(m: AssistantChatMessage): string {
  const blocks: Array<string | null> = [m.title, m.text]
  const { table } = m
  if (table) {
    const lines = [table.columns.map((c) => c.label).join('\t')]
    table.rows.forEach((r) => lines.push(table.columns.map((c) => r.cells[c.key] ?? '').join('\t')))
    blocks.push(lines.join('\n'))
  }
  if (m.notice) blocks.push(m.notice.text)
  return blocks.filter(Boolean).join('\n\n')
}

const isInternalPath = (to: string) => to.startsWith('/') && !to.startsWith('//')

function Author() {
  return (
    <div className={styles.author}>
      <span className={styles.avatar}>
        <SparkleIcon size={16} />
      </span>
      <span className={styles.name}>HR-аналитик</span>
    </div>
  )
}

interface AssistantMessageProps {
  message: AssistantChatMessage
  busy: boolean
  onAsk: (question: string) => void
  onRetry: (message: AssistantChatMessage) => void
  onToggleSave: (message: AssistantChatMessage) => void
}

export default function AssistantMessage({ message, busy, onAsk, onRetry, onToggleSave }: AssistantMessageProps) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  if (message.status === 'pending') {
    return (
      <div className={styles.message}>
        <Author />
        <div className={styles.typing} role="status">
          <span className={styles.dots} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          Анализирую данные…
        </div>
      </div>
    )
  }

  if (message.status === 'error') {
    return (
      <div className={styles.message}>
        <Author />
        <h3 className={styles.title} title={message.detail ?? undefined}>
          Не удалось получить ответ
        </h3>
        <p className={styles.text}>Вопрос сохранён. Попробуйте выполнить анализ ещё раз.</p>
        {message.question && (
          <Button disabled={busy} onClick={() => onRetry(message)}>
            <RefreshIcon size={18} />
            Повторить попытку
          </Button>
        )}
      </div>
    )
  }

  const asButtons = message.status === 'insufficient_data' || message.notice?.kind === 'warning'

  const runAction = (action: MessageAction) => {
    if (action.type === 'navigate') {
      if (isInternalPath(action.to)) void navigate(action.to)
    } else if (!busy) {
      onAsk(action.question)
    }
  }

  const copy = async () => {
    if (await copyText(toPlainText(message))) {
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <div className={styles.message}>
      <Author />
      {message.meta && <div className={styles.meta}>{message.meta}</div>}
      {message.title && <h3 className={styles.title}>{message.title}</h3>}
      {message.text && <p className={styles.text}>{message.text}</p>}
      {message.table && <AnalysisTable table={message.table} />}
      {message.notice && <Notice notice={message.notice} />}

      <div className={styles.actions}>
        {asButtons ? (
          message.actions.map((a) =>
            a.type === 'navigate' ? (
              <Button key={a.label} variant="ghost" onClick={() => runAction(a)}>
                <DatabaseIcon size={18} />
                {a.label}
              </Button>
            ) : (
              <Button key={a.label} disabled={busy} onClick={() => runAction(a)}>
                {a.label}
              </Button>
            ),
          )
        ) : (
          <>
            <button type="button" className={styles.copy} onClick={() => void copy()}>
              {copied ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
              {copied ? 'Скопировано' : 'Скопировать ответ'}
            </button>
            {message.actions.map((a) => (
              <button
                key={a.label}
                type="button"
                className={styles.link}
                disabled={a.type === 'ask' && busy}
                onClick={() => runAction(a)}
              >
                <ChevronRightIcon size={18} />
                {a.label}
              </button>
            ))}
            {message.apiId !== null && (
              <button
                type="button"
                className={cx(styles.save, message.isSaved && styles.saved)}
                aria-pressed={message.isSaved}
                title={message.isSaved ? 'Убрать из сохранённых' : 'Сохранить ответ'}
                aria-label={message.isSaved ? 'Убрать из сохранённых' : 'Сохранить ответ'}
                onClick={() => onToggleSave(message)}
              >
                <BookmarkIcon size={18} filled={message.isSaved} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
