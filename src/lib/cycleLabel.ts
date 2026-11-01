/** Display name for a cycle/path from gameData (English source labels). */
export function formatCycleDisplayName(name: string, locale: string): string {
  if (!locale.startsWith('pt')) return name
  return name.replace(/^Path\b/i, 'Ciclo')
}

export function cycleDisplayNameForId(
  pathId: string,
  rawName: string | undefined,
  locale: string,
): string {
  const base = rawName ?? pathId
  return formatCycleDisplayName(base, locale)
}
