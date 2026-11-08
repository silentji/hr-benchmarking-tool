import type { Conversation } from '../types/chat'
import { parseDate } from './date'

export interface ConversationGroup {
  key: string
  label: string
  items: Conversation[]
}

interface Bucket extends ConversationGroup {
  min: number
}

export function groupConversations(
  items: Conversation[],
  query = '',
  now: Date = new Date(),
): ConversationGroup[] {
  const q = query.trim().toLowerCase()
  const y = now.getFullYear()
  const m = now.getMonth()
  const d = now.getDate()

  const buckets: Bucket[] = [
    { key: 'today', label: 'Сегодня', min: new Date(y, m, d).getTime(), items: [] },
    { key: 'yesterday', label: 'Вчера', min: new Date(y, m, d - 1).getTime(), items: [] },
    { key: 'week', label: 'Предыдущие 7 дней', min: new Date(y, m, d - 7).getTime(), items: [] },
  ]
  if (q) buckets.push({ key: 'older', label: 'Ранее', min: -Infinity, items: [] })

  const source = q ? items.filter((c) => (c.title || 'Новый диалог').toLowerCase().includes(q)) : items

  source
    .map((c) => ({ c, t: parseDate(c.updatedAt)?.getTime() ?? now.getTime() }))
    .sort((a, b) => b.t - a.t)
    .forEach(({ c, t }) => {
      const bucket = buckets.find((b) => t >= b.min)
      if (bucket) bucket.items.push(c)
    })

  return buckets.filter((b) => b.items.length > 0).map(({ key, label, items: list }) => ({ key, label, items: list }))
}
