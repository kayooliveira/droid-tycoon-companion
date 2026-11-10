/** pt-BR calendar date for verified-at strings (YYYY-MM-DD or ISO). */
export function formatVerifiedDatePt(isoOrYmd: string, locale: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoOrYmd)
  if (!m) return isoOrYmd
  const [, y, mo, d] = m
  if (locale.startsWith('pt')) return `${d}/${mo}/${y}`
  return `${y}-${mo}-${d}`
}
