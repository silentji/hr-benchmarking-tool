import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { askQuestion } from '../store/chatSlice'

export type AskFn = (text: string) => Promise<boolean>

export function useAsk(conversationId: string | undefined) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const sending = useAppSelector((s) => Boolean(conversationId && s.chat.byId[conversationId]?.sending))
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const busy = sending || creating

  const ask: AskFn = useCallback(
    async (text) => {
      const question = text.trim()
      if (!question || busy) return false
      setError(null)
      setCreating(!conversationId)
      try {
        const id = await dispatch(askQuestion({ conversationId, question })).unwrap()
        if (!conversationId) navigate(`/c/${id}`)
        return true
      } catch {
        setError('Не удалось создать диалог. Попробуйте ещё раз.')
        return false
      } finally {
        setCreating(false)
      }
    },
    [busy, conversationId, dispatch, navigate],
  )

  return { ask, busy, error }
}
