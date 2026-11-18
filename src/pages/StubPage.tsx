import { Fragment, type ReactNode } from 'react'
import Button from '../components/Button'
import PageHeader from '../components/PageHeader'
import ScrollArea from '../components/ScrollArea'
import StateMessage, { StateTitle } from '../components/StateMessage'
import styles from './StubPage.module.css'

interface StubPageProps {
  title: string
  icon: ReactNode
}

export default function StubPage({ title, icon }: StubPageProps) {
  return (
    <Fragment>
      <PageHeader title={title} />
      <ScrollArea>
        <StateMessage column>
          <span className={styles.icon}>{icon}</span>
          <StateTitle>Раздел «{title}» находится в разработке</StateTitle>
          <p className={styles.note}>Он появится в одной из следующих версий сервиса.</p>
          <Button to="/">Вернуться к диалогам</Button>
        </StateMessage>
      </ScrollArea>
    </Fragment>
  )
}
