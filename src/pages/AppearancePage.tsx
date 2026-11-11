import { Moon, Sun, Desktop } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ThemeCardGroup } from '../components/appearance/ThemeCard'
import { TabScrollLayout } from '../components/layout/TabScrollLayout'
import { useAppearance, type AppearanceModePref } from '../hooks/useAppearance'
import { uiIconProps } from '../components/ui/iconStyle'

const MODES: { value: AppearanceModePref; icon: typeof Moon; labelKey: string }[] = [
  { value: 'system', icon: Desktop, labelKey: 'settings.themeSystem' },
  { value: 'light', icon: Sun, labelKey: 'settings.themeLight' },
  { value: 'dark', icon: Moon, labelKey: 'settings.themeDark' },
]

export function AppearancePage() {
  const { t } = useTranslation()
  const { theme, modePref, setTheme, setModePref } = useAppearance()

  return (
    <TabScrollLayout
      title={t('settings.appearance')}
      testId="appearance-page"
      className="appearance-tight"
      backBar={
        <div className="backbar">
          <Link to="/settings" className="top-back">
            <svg className="ic" width={20} height={20} viewBox="0 0 24 24" aria-hidden>
              <path d="m9 5 7 7-7 7" />
            </svg>
            {t('nav.settings')}
          </Link>
        </div>
      }
    >
      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">{t('appearance.visualTheme')}</h2>
        </div>
        <ThemeCardGroup value={theme} onChange={setTheme} />
      </section>

      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">{t('settings.theme')}</h2>
        </div>
        <div className="seg" role="group" aria-label={t('settings.theme')}>
          {MODES.map(({ value, icon: Icon, labelKey }) => (
            <button
              key={value}
              type="button"
              aria-pressed={modePref === value}
              onClick={() => setModePref(value)}
            >
              <Icon {...uiIconProps} size={18} className="inline-block align-middle mr-1" />
              {t(labelKey)}
            </button>
          ))}
        </div>
      </section>
    </TabScrollLayout>
  )
}
