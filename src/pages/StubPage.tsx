import { Fragment, type ReactNode } from 'react'
import ScrollArea from '../components/ScrollArea/ScrollArea'
import styles from './StubPage.module.css'
import PageHeader from '../components/PageHeader/PageHeader'
import StateMessage, { StateTitle } from '../components/StateMessage/StateMessage'
import Button from '../components/Button/Button'

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
