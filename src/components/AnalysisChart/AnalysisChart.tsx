import type { ChartData } from '../../types/chat'
import { cx } from '../../utils/cx'
import styles from './AnalysisChart.module.css'

const NBSP = ' '
const SERIES_COLORS = 4 // s0…s3 в CSS; серии сверх этого идут по кругу

/** «Красивый» шаг оси: 1, 2, 2.5, 5 × 10^n. */
function niceStep(raw: number): number {
  const base = 10 ** Math.floor(Math.log10(raw))
  const f = raw / base
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10
  return nice * base
}

const round = (x: number) => Number(x.toFixed(10))

/** Ось от нуля до «круглого» максимума, примерно на 5 делений. Отрицательные значения не поддерживаются. */
export function buildAxis(max: number, targetTicks = 5): { max: number; ticks: number[] } {
  if (!(max > 0)) return { max: 1, ticks: [0, 1] }
  const step = niceStep(max / targetTicks)
  const count = Math.ceil(max / step - 1e-9)
  return {
    max: round(count * step),
    ticks: Array.from({ length: count + 1 }, (_, i) => round(i * step)),
  }
}

function decimals(v: number): number {
  const s = String(v)
  const i = s.indexOf('.')
  return i < 0 ? 0 : Math.min(2, s.length - i - 1)
}

interface AnalysisChartProps {
  chart: ChartData
}

/** Сгруппированная горизонтальная диаграмма на HTML/CSS: без библиотек, текст выделяется и копируется. */
export default function AnalysisChart({ chart }: AnalysisChartProps) {
  const { series, categories, unit } = chart
  const values = categories
    .flatMap((c) => series.map((s) => c.values[s.key]))
    .filter((v): v is number => typeof v === 'number' && Number.isFinite(v))

  const axis = buildAxis(Math.max(0, ...values))
  // Одинаковое число знаков у всех значений: «6,0», а не «6».
  const digits = Math.max(0, ...values.map(decimals))
  const format = (v: number) =>
    `${v.toLocaleString('ru-RU', { minimumFractionDigits: digits, maximumFractionDigits: digits })}${unit ? NBSP + unit : ''}`
  const colorOf = (i: number) => styles[`s${i % SERIES_COLORS}`]

  return (
    <figure className={styles.chart}>
      {chart.title && <figcaption className={styles.title}>{chart.title}</figcaption>}

      {series.length > 1 && (
        <ul className={styles.legend}>
          {series.map((s, i) => (
            <li key={s.key}>
              <span className={cx(styles.swatch, colorOf(i))} aria-hidden="true" />
              {s.label}
            </li>
          ))}
        </ul>
      )}

      <div className={styles.grid}>
        {categories.map((cat, ci) => (
          <div key={ci} className={styles.row}>
            <div className={styles.label}>{cat.label}</div>

            <div className={styles.lanes} aria-hidden="true">
              {series.map((s, si) => {
                const v = cat.values[s.key]
                const width = typeof v === 'number' ? Math.min(100, Math.max(0, (v / axis.max) * 100)) : 0
                return (
                  <div key={s.key} className={styles.lane}>
                    {width > 0 && <span className={cx(styles.bar, colorOf(si))} style={{ width: `${width}%` }} />}
                  </div>
                )
              })}
            </div>

            <div className={styles.values}>
              {series.map((s) => {
                const v = cat.values[s.key]
                return (
                  <div key={s.key} className={styles.lane}>
                    {/* Для скринридеров значение подписано названием серии. */}
                    <span className={styles.srOnly}>{s.label}: </span>
                    {typeof v === 'number' ? format(v) : '—'}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <div className={styles.axisRow} aria-hidden="true">
          <div />
          <div className={styles.axis}>
            {axis.ticks.map((t) => (
              <span key={t} className={styles.tick} style={{ left: `${(t / axis.max) * 100}%` }}>
                {t.toLocaleString('ru-RU')}
              </span>
            ))}
          </div>
          <div />
        </div>
      </div>
    </figure>
  )
}
