/** Production site URL (OG, share links). */
export const APP_PUBLIC_URL = 'https://dthelper.kayooliveira.com'

const DEFAULT_REPORT_FEEDBACK_URL = 'https://chat.whatsapp.com/CAF0fffBoJt47D6MCtrL96'

/**
 * Feedback / community URL. Override at build time with VITE_REPORT_FEEDBACK_URL.
 */
export const REPORT_FEEDBACK_URL: string =
  import.meta.env.VITE_REPORT_FEEDBACK_URL !== undefined
    ? String(import.meta.env.VITE_REPORT_FEEDBACK_URL)
    : DEFAULT_REPORT_FEEDBACK_URL

export const WHATSAPP_SHARE_BASE = 'https://wa.me/?text='
