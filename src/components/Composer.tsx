import { useEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import type { AskFn } from '../hooks/useAsk'
import { setDraft } from '../store/chatSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { cx } from '../utils/cx'
import { ArrowUpIcon } from './icons'
import styles from './Composer.module.css'

const MAX_HEIGHT = 200

interface ComposerProps {
  onSubmit: AskFn
  busy: boolean
  error: string | null
  focusKey: string
}

export default function Composer({ onSubmit, busy, error, focusKey }: ComposerProps) {
  const dispatch = useAppDispatch()
  const draft = useAppSelector((s) => s.chat.draft)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`
  }, [draft])

  useEffect(() => {
    ref.current?.focus()
  }, [focusKey])

  const canSend = draft.trim().length > 0 && !busy

  const submit = async () => {
    if (!canSend) return
    if (await onSubmit(draft)) dispatch(setDraft(''))
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      void submit()
    }
  }

  return (
    <div className={styles.composer}>
      <div className={styles.box}>
        <textarea
          id="composer-input"
          ref={ref}
          rows={1}
          value={draft}
          placeholder="Задайте вопрос о показателях предприятий…"
          aria-label="Вопрос о показателях предприятий"
          onChange={(e) => dispatch(setDraft(e.target.value))}
          onKeyDown={onKeyDown}
        />
        <div className={styles.row}>
          <span className={styles.hint}>Период и предприятия укажите в вопросе</span>
          <button
            type="button"
            className={cx(styles.send, canSend && styles.sendActive)}
            disabled={!canSend}
            aria-label="Отправить"
            onClick={() => void submit()}
          >
            <ArrowUpIcon size={18} />
          </button>
        </div>
      </div>
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}
      <div className={styles.keys}>Enter — отправить · Shift + Enter — перенос строки</div>
    </div>
  )
}
