import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Button from '../components/Button'
import Composer from '../components/Composer'
import MessageList from '../components/MessageList'
import PageHeader from '../components/PageHeader'
import ScrollArea from '../components/ScrollArea'
import StateMessage, { Spinner, StateTitle } from '../components/StateMessage'
import WelcomeScreen from '../components/WelcomeScreen'
import { CheckIcon } from '../components/icons'
import { useAsk } from '../hooks/useAsk'
import { fetchConversation, selectEntry, sendQuestion, toggleSaved } from '../store/chatSlice'
import { useAppDispatch, useAppSelector, useAppStore } from '../store/hooks'
import type { AssistantChatMessage } from '../types/chat'
import { cx } from '../utils/cx'
import styles from './ChatPage.module.css'

function SaveStatus({ sending }: { sending: boolean }) {
  return sending ? (
    <span className={styles.status}>Сохранение…</span>
  ) : (
    <span className={cx(styles.status, styles.statusOk)}>
      <CheckIcon size={16} />
      Сохранено
    </span>
  )
}

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const dispatch = useAppDispatch()
  const store = useAppStore()
  const entry = useAppSelector((s) => selectEntry(s, conversationId))
  const title = useAppSelector((s) => s.conversations.items.find((c) => c.id === conversationId)?.title)
  const { ask, busy, error } = useAsk(conversationId)

  useEffect(() => {
    if (!conversationId) return
    const current = store.getState().chat.byId[conversationId]
    if (!current || current.status === 'failed') void dispatch(fetchConversation(conversationId))
  }, [conversationId, dispatch, store])

  const messages = entry?.messages ?? []

  const retry = (message: AssistantChatMessage) => {
    if (!conversationId || !message.question || busy) return
    void dispatch(sendQuestion({ conversationId, question: message.question, retryPlaceholderId: message.id }))
  }

  const toggleSave = (message: AssistantChatMessage) => {
    if (!conversationId || message.apiId === null) return
    void dispatch(
      toggleSaved({ conversationId, messageId: message.id, apiId: message.apiId, isSaved: !message.isSaved }),
    )
  }

  let body
  if (!conversationId || (entry?.status === 'succeeded' && messages.length === 0)) {
    body = <WelcomeScreen onAsk={ask} busy={busy} />
  } else if (!entry || entry.status === 'idle' || entry.status === 'loading') {
    body = (
      <StateMessage>
        <Spinner />
        Загружаю диалог…
      </StateMessage>
    )
  } else if (entry.status === 'failed') {
    const notFound = entry.error?.status === 404
    body = (
      <StateMessage column>
        <StateTitle>{notFound ? 'Диалог не найден' : 'Не удалось загрузить диалог'}</StateTitle>
        {notFound ? (
          <Button to="/">Новый диалог</Button>
        ) : (
          <Button onClick={() => void dispatch(fetchConversation(conversationId))}>Повторить попытку</Button>
        )}
      </StateMessage>
    )
  } else {
    body = (
      <MessageList messages={messages} busy={busy} onAsk={(q) => void ask(q)} onRetry={retry} onToggleSave={toggleSave} />
    )
  }

  const headerRight = conversationId ? (
    entry?.status === 'succeeded' && <SaveStatus sending={entry.sending} />
  ) : (
    <span className={styles.hint}>HR-аналитика</span>
  )

  return (
    <>
      <PageHeader title={(conversationId && title) || 'Новый диалог'} right={headerRight} />
      <ScrollArea>{body}</ScrollArea>
      <Composer onSubmit={ask} busy={busy} error={error} focusKey={conversationId ?? 'new'} />
    </>
  )
}
