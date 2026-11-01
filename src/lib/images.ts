const BASE = import.meta.env.BASE_URL

export function droidImageSrc(_droidId: string, imageLocal?: string): string {
  if (imageLocal) {
    const filename = imageLocal.replace(/^images\//, '')
    return `${BASE}assets/droids/${filename}`
  }
  return `${BASE}assets/droids/placeholder.svg`
}

export function isMissingImageFlag(droid: { imageMissing?: boolean }): boolean {
  return Boolean(droid.imageMissing)
}
