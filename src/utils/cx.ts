//склейка имён классов cx(styles.a, isActive && styles.active)
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
