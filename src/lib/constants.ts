/** Production site URL (OG, share links). */
export const APP_PUBLIC_URL = 'https://dthelper.kayooliveira.com'

/**
 * Optional feedback URL (Google Form, GitHub issue template, etc.).
 * Leave empty in repo — owner can set at build time via VITE_REPORT_FEEDBACK_URL.
 */
export const REPORT_FEEDBACK_URL: string = import.meta.env.VITE_REPORT_FEEDBACK_URL ?? ''

export const WHATSAPP_SHARE_BASE = 'https://wa.me/?text='
