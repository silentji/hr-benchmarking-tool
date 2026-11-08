const HAS_TZ = /(Z|[+-]\d{2}:?\d{2})$/i

export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null
  let s = value.trim()
  if (/^\d{4}-\d{2}-\d{2}[T ]\d/.test(s) && !HAS_TZ.test(s)) {
    s = `${s.replace(' ', 'T')}Z`
  }
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d
}
