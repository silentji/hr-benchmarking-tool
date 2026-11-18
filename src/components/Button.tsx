import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cx } from '../utils/cx'
import styles from './Button.module.css'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: 'outline' | 'ghost'
  to?: string
  children: ReactNode
}

export default function Button({ variant = 'outline', to, className, children, ...rest }: ButtonProps) {
  const cls = cx(styles.button, styles[variant], className)
  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  )
}
