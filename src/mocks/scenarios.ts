import type { ApiAnalysis, ApiTable } from '../api/types'

const CONTEXT_ALL = { period: 'Сентябрь 2026', enterprises: ['Север', 'Юг', 'Запад'] }

const ENTERPRISES_TABLE: ApiTable = {
  columns: [
    { key: 'name', label: 'Предприятие', align: 'left' },
    { key: 'fact', label: 'Факт, %' },
    { key: 'plan', label: 'План, %' },
    { key: 'toPlan', label: 'К плану, п.п.', accent: true },
    { key: 'aug', label: 'Август, %' },
    { key: 'toAug', label: 'К августу, п.п.', accent: true },
  ],
  rows: [
    { highlight: true, cells: { name: 'Север', fact: '8,4', plan: '6,5', toPlan: '+1,9', aug: '7,1', toAug: '+1,3' } },
    { cells: { name: 'Юг', fact: '6,2', plan: '6,0', toPlan: '+0,2', aug: '6,0', toAug: '+0,2' } },
    { cells: { name: 'Запад', fact: '5,2', plan: '5,5', toPlan: '−0,3', aug: '5,8', toAug: '−0,6' } },
  ],
}

const deviations = (): ApiAnalysis => ({
  context: CONTEXT_ALL,
  title: 'Что требует внимания в сентябре',
  text: 'Сравнил доступную текучесть с планом и августом. Самое большое превышение плана — на «Севере»: +1,9 п.п.',
  table: ENTERPRISES_TABLE,
  notice: {
    kind: 'info',
    text: 'Выделение показывает различия в значениях. Оно не устанавливает причины и не означает статистическую значимость.',
  },
  actions: [
    {
      type: 'ask',
      label: 'Подробнее о «Севере»',
      question: 'Расскажи подробнее о текучести на «Севере» за сентябрь 2026 года.',
    },
  ],
})

const enterprises = (): ApiAnalysis => ({
  context: CONTEXT_ALL,
  title: 'Текучесть предприятий за сентябрь',
  text: 'Максимальная текучесть — на «Севере» (8,4 %), минимальная — на «Западе» (5,2 %).',
  table: ENTERPRISES_TABLE,
  actions: [{ type: 'ask', label: 'Найти отклонения', question: 'Найди отклонения в доступных данных.' }],
})

const insufficientData = (): ApiAnalysis => ({
  status: 'insufficient_data',
  context: { period: 'Сентябрь 2026', enterprises: ['подразделения'] },
  title: 'Для такого сравнения не хватает данных',
  text: 'За сентябрь доступны значения по предприятиям, но нет разбивки по производственным подразделениям. Корректно сравнить их не получится.',
  notice: {
    kind: 'warning',
    text: 'Могу сравнить «Север», «Юг» и «Запад» за тот же период или дождаться загрузки данных подразделений.',
  },
  actions: [
    { type: 'ask', label: 'Сравнить предприятия', question: 'Сравни предприятия по текучести за сентябрь 2026 года.' },
    { type: 'navigate', label: 'Перейти к данным', to: '/data' },
  ],
})

const changeVsAugust = (): ApiAnalysis => ({
  context: { period: 'Август → сентябрь 2026', enterprises: ['Север'] },
  title: 'Рост на 1,3 процентного пункта',
  text: 'В августе текучесть составляла 7,1 %, в сентябре — 8,4 %.\nРазница: 8,4 − 7,1 = 1,3 п.п.\n\nСохранил предприятие и показатель из предыдущего вопроса. Причины роста по этим данным не установлены.',
  actions: [{ type: 'ask', label: 'Сравнить предприятия', question: 'Сравни предприятия по текучести за сентябрь 2026 года.' }],
})

const turnoverNorth = (): ApiAnalysis => ({
  context: { period: 'Сентябрь 2026', enterprises: ['Север'] },
  text: 'Текучесть — 8,4 %. Это на 1,9 п.п. выше плана (6,5 %).',
})

const fallback = (): ApiAnalysis => ({
  title: 'Уточните запрос',
  text: 'Я могу сравнить предприятия, план и факт или найти отклонения. Укажите в вопросе период и предприятие.',
  actions: [{ type: 'ask', label: 'Найти отклонения', question: 'Найди отклонения в доступных данных.' }],
})

export function analyze(question: string): ApiAnalysis | 'fail' {
  const q = question.toLowerCase()
  if (/подразделен/.test(q)) return insufficientData()
  if (/сбой|ошибк/.test(q)) return 'fail'
  if (/отклонен|внимани|план/.test(q)) return deviations()
  if (/предприят/.test(q)) return enterprises()
  if (/август|измен|динамик/.test(q)) return changeVsAugust()
  if (/север|текучест/.test(q)) return turnoverNorth()
  return fallback()
}
