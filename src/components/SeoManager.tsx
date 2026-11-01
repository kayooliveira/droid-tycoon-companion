import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

const SITE = 'https://dthelper.kayooliveira.com'
const OG_IMAGE = `${SITE}/og-image.png`
const OG_IMAGE_ALT = 'Droid Tycoon Companion — rebirths, inventory, and sell tips'

const routeKeys: Record<string, string> = {
  '/': 'nav.dashboard',
  '/progress': 'nav.progress',
  '/inventory': 'nav.inventory',
  '/sell': 'nav.sell',
  '/droiddex': 'nav.droiddex',
  '/fusion': 'nav.fusion',
  '/settings': 'nav.settings',
  '/onboarding': 'onboarding.welcomeTitle',
}

function upsertMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.content = content
}

export function SeoManager() {
  const { t, i18n } = useTranslation()
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname || '/'
    const section = t(routeKeys[path] ?? 'app.name')
    const title = `${section} · ${t('app.name')}`
    document.title = title

    const desc =
      i18n.language === 'pt-BR' ? t('seo.descriptionPt') : t('seo.description')
    const url = `${SITE}${path === '/' ? '' : path}`

    upsertMeta('description', desc)
    upsertMeta('og:title', title, 'property')
    upsertMeta('og:description', desc, 'property')
    upsertMeta('og:url', url, 'property')
    upsertMeta('og:type', 'website', 'property')
    upsertMeta('og:image', OG_IMAGE, 'property')
    upsertMeta('og:image:width', '1200', 'property')
    upsertMeta('og:image:height', '630', 'property')
    upsertMeta('og:image:alt', OG_IMAGE_ALT, 'property')
    upsertMeta('twitter:card', 'summary_large_image')
    upsertMeta('twitter:title', title)
    upsertMeta('twitter:description', desc)
    upsertMeta('twitter:image', OG_IMAGE)

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url
  }, [location.pathname, t, i18n.language])

  useEffect(() => {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: t('app.name'),
      url: SITE,
      description: t('seo.description'),
      applicationCategory: 'GameApplication',
      operatingSystem: 'Web',
    }
    let script = document.getElementById('json-ld-app') as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = 'json-ld-app'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(jsonLd)
  }, [t, i18n.language])

  return null
}
