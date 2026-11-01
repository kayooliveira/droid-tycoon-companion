import en from '../i18n/locales/en.json'
import pt from '../i18n/locales/pt-BR.json'

export type ExportPdfLocale = 'en' | 'pt-BR'

export type PdfCopy = (typeof en)['pdf']

export function getPdfCopy(locale: ExportPdfLocale): PdfCopy {
  return locale === 'pt-BR' ? pt.pdf : en.pdf
}
