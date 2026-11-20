import type { AskFn } from '../../hooks/useAsk'
import { setDraft } from '../../store/chatSlice'
import { useAppDispatch } from '../../store/hooks'
import Button from '../Button/Button'
import { BarChartIcon, SparkleIcon } from '../icons'
import styles from './WelcomeScreen.module.css'

// Карточки подставляют заготовку в поле ввода — период и предприятие пользователь дописывает сам.
const CARDS = [
  { title: 'Сравнить предприятия', subtitle: 'За один и тот же период', prompt: 'Сравни предприятия по текучести за ' },
  { title: 'Сравнить с планом', subtitle: 'Найти различия в значениях', prompt: 'Сравни факт с планом по текучести за ' },
  { title: 'Посмотреть динамику', subtitle: 'Что изменилось со временем', prompt: 'Покажи динамику текучести за ' },
]

const DEVIATIONS_QUESTION = 'Найди отклонения в доступных данных.'

interface WelcomeScreenProps {
  onAsk: AskFn
  busy: boolean
}

export default function WelcomeScreen({ onAsk, busy }: WelcomeScreenProps) {
  const dispatch = useAppDispatch()

  const prefill = (text: string) => {
    dispatch(setDraft(text))
    setTimeout(() => {
      const el = document.getElementById('composer-input') as HTMLTextAreaElement | null
      if (!el) return
      el.focus()
      el.setSelectionRange(text.length, text.length)
    }, 0)
  }

  return (
    <div className={styles.welcome}>
      <h2 className={styles.title}>
        Что хотите узнать
        <br />о HR‑показателях?
      </h2>
      <p className={styles.subtitle}>
        Сравнивайте предприятия, план и факт.
        <br />
        Находите изменения и разбирайтесь в данных через диалог.
      </p>

      <div className={styles.cards}>
        {CARDS.map((card) => (
          <button key={card.title} type="button" className={styles.card} onClick={() => prefill(card.prompt)}>
            <BarChartIcon size={20} />
            <span>
              <span className={styles.cardTitle}>{card.title}</span>
              <span className={styles.cardSubtitle}>{card.subtitle}</span>
            </span>
          </button>
        ))}
      </div>

      <Button className={styles.cta} disabled={busy} onClick={() => void onAsk(DEVIATIONS_QUESTION)}>
        <SparkleIcon size={18} />
        Найти отклонения
      </Button>
      <p className={styles.caption}>Обзор доступных данных и заметных изменений</p>
    </div>
  )
}
