/** ISO `yyyy-mm-dd` → pt-BR `dd/mm/yyyy`; otherwise passthrough. */
export function formatLocaleDate(iso: string, locale: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!m) return iso
  const [, y, mo, d] = m
  if (locale.startsWith('pt')) return `${d}/${mo}/${y}`
  return iso
}
