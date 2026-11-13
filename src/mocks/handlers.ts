import type { ApiAnalysis, ApiConversation, ApiMessage } from '../api/types'
import { analyze } from './scenarios'

const analyzeOrFallback = (question: string): ApiAnalysis => {
  const result = analyze(question)
  return result === 'fail' ? (analyze('текучесть') as ApiAnalysis) : result
}

export interface MockRequest {
  method: string
  path: string
  body: unknown
}

export interface MockResult {
  status: number
  data: unknown
  delay: number
}

interface StoredConversation {
  meta: Required<Pick<ApiConversation, 'id' | 'title' | 'created_at' | 'updated_at'>>
  messages: ApiMessage[]
}

const conversations = new Map<string, StoredConversation>()
const failedOnce = new Set<string>()
let seeded = false
let convSeq = 0
let msgSeq = 0

//дата относительно сегодняшнего дня
function at(dayOffset: number, hour: number): string {
  const n = new Date()
  if (dayOffset === 0) return new Date(n.getTime() - (13 - hour) * 60_000).toISOString()
  return new Date(n.getFullYear(), n.getMonth(), n.getDate() - dayOffset, hour).toISOString()
}

const truncate = (s: string, n = 60) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s)

function addMessage(
  conv: StoredConversation,
  question: string,
  createdAt: string,
  analysis: ApiAnalysis = analyzeOrFallback(question),
): ApiMessage {
  const message: ApiMessage = { id: String(++msgSeq), question, analysis, is_saved: false, created_at: createdAt }
  conv.messages.push(message)
  conv.meta.updated_at = createdAt
  return message
}

function seed() {
  seeded = true
  const items: Array<{ title: string; day: number; hour: number; questions: string[] }> = [
    {
      title: 'Текучесть: факт и план',
      day: 0,
      hour: 11,
      questions: ['Какая текучесть на «Севере» за сентябрь 2026 года?', 'А что изменилось относительно августа?'],
    },
    { title: 'Изменения за сентябрь', day: 0, hour: 10, questions: ['Что изменилось за сентябрь по сравнению с августом?'] },
    { title: 'Сравнение предприятий', day: 0, hour: 9, questions: ['Сравни предприятия по текучести за сентябрь 2026 года.'] },
    { title: 'Динамика за квартал', day: 1, hour: 15, questions: ['Покажи динамику текучести за квартал.'] },
    { title: 'Отклонения от плана', day: 1, hour: 14, questions: ['Найди отклонения от плана.'] },
    {
      title: 'Показатели подразделений',
      day: 1,
      hour: 13,
      questions: ['Сравни текучесть производственных подразделений за сентябрь 2026 года.'],
    },
    { title: 'План и факт за август', day: 3, hour: 12, questions: ['Сравни план и факт за август.'] },
    { title: 'Сравнение с предыдущим периодом', day: 4, hour: 12, questions: ['Сравни текучесть с предыдущим периодом.'] },
    { title: 'Что изменилось за июль', day: 5, hour: 12, questions: ['Что изменилось за июль?'] },
  ]
  for (const it of [...items].reverse()) {
    const id = String(++convSeq)
    const created = at(it.day, it.hour)
    const conv: StoredConversation = {
      meta: { id, title: it.title, created_at: created, updated_at: created },
      messages: [],
    }
    conversations.set(id, conv)
    it.questions.forEach((q, i) => addMessage(conv, q, at(it.day, it.hour + i)))
  }
}

const json = (status: number, data: unknown, delay = 250): MockResult => ({ status, data, delay })
const notFound = (what: string) => json(404, { detail: `${what} не найден` }, 200)

export function handleMockRequest({ method, path, body }: MockRequest): MockResult {
  if (!seeded) seed()
  const url = path.split('?')[0].replace(/\/+$/, '')

  if (url === '/conversations') {
    if (method === 'GET') {
      const list = [...conversations.values()]
        .map((c) => c.meta)
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      return json(200, list)
    }
    if (method === 'POST') {
      const now = new Date().toISOString()
      const id = String(++convSeq)
      conversations.set(id, { meta: { id, title: '', created_at: now, updated_at: now }, messages: [] })
      return json(201, { id, title: '', created_at: now, updated_at: now })
    }
  }

  const conv = /^\/conversations\/([^/]+)$/.exec(url)
  if (conv && method === 'GET') {
    const found = conversations.get(decodeURIComponent(conv[1]))
    return found ? json(200, { ...found.meta, messages: found.messages }) : notFound('Диалог')
  }

  const send = /^\/conversations\/([^/]+)\/messages$/.exec(url)
  if (send && method === 'POST') {
    const found = conversations.get(decodeURIComponent(send[1]))
    if (!found) return notFound('Диалог')
    const question = (body as { question?: unknown } | null)?.question
    if (typeof question !== 'string' || !question.trim()) return json(422, { detail: 'Пустой вопрос' }, 100)

    const text = question.trim()
    if (analyze(text) === 'fail' && !failedOnce.has(text)) {
      failedOnce.add(text)
      return json(500, { detail: 'Мок: имитация сбоя анализа' }, 700)
    }
    const message = addMessage(found, text, new Date().toISOString())
    if (!found.meta.title) found.meta.title = truncate(text)
    return json(200, message, 900)
  }

  const msg = /^\/messages\/([^/]+)$/.exec(url)
  if (msg && method === 'PATCH') {
    const id = decodeURIComponent(msg[1])
    for (const c of conversations.values()) {
      const m = c.messages.find((x) => x.id === id)
      if (m) {
        m.is_saved = Boolean((body as { is_saved?: unknown } | null)?.is_saved)
        return json(200, { id: m.id, is_saved: m.is_saved }, 150)
      }
    }
    return notFound('Ответ')
  }

  if (url === '/enterprises' && method === 'GET') {
    return json(200, [
      { id: 'north', name: 'Север' },
      { id: 'south', name: 'Юг' },
      { id: 'west', name: 'Запад' },
    ])
  }
  if (url === '/metrics' && method === 'GET') {
    return json(200, [
      { id: 'turnover', name: 'Текучесть', unit: '%' },
      { id: 'headcount', name: 'Численность', unit: 'чел.' },
    ])
  }

  return notFound('Маршрут')
}

export function resetMockState() {
  conversations.clear()
  failedOnce.clear()
  seeded = false
  convSeq = 0
  msgSeq = 0
}
