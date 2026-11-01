import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ptBR from './locales/pt-BR.json'
import type { AppLocale } from './detectLocale'

export const supportedLocales: AppLocale[] = ['en', 'pt-BR']

export function initI18n(locale: AppLocale): typeof i18n {
  if (i18n.isInitialized) {
    void i18n.changeLanguage(locale)
    return i18n
  }

  void i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      'pt-BR': { translation: ptBR },
    },
    lng: locale,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

  return i18n
}

export function setDocumentLanguage(locale: AppLocale): void {
  document.documentElement.lang = locale === 'pt-BR' ? 'pt-BR' : 'en'
}

export { i18n }
