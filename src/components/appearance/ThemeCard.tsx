import { useTranslation } from 'react-i18next'
import { droidById } from '../../domain/gameData'
import { droidImageSrc } from '../../lib/images'
import type { AppearanceTheme } from '../../hooks/useAppearance'

const THEME_KEYS: AppearanceTheme[] = ['oficina', 'figurinhas', 'cartaz']

export function ThemeCard({
  themeKey,
  selected,
  onSelect,
}: {
  themeKey: AppearanceTheme
  selected: boolean
  onSelect: (theme: AppearanceTheme) => void
}) {
  const { t } = useTranslation()
  const name = t(`appearance.themes.${themeKey}.name`)
  const desc = t(`appearance.themes.${themeKey}.desc`)
  const droid = droidById.get('r7') ?? droidById.get('r2-d2')
  const cols = themeKey === 'figurinhas' ? 10 : 20
  const cells = Array.from({ length: 20 }, (_, i) => (
    <i key={i} className={i < 12 ? 'done' : i === 12 ? 'cur' : undefined} />
  ))

  return (
    <button
      type="button"
      className="tcard"
      role="radio"
      aria-checked={selected}
      aria-label={t('appearance.themeAria', { name })}
      onClick={() => onSelect(themeKey)}
    >
      <div className="tp" data-theme={themeKey} data-theme-scope>
        {droid ? (
          <span className="dtile" data-tier="galactic">
            <span className="dtile-bg" aria-hidden />
            <span className="dtile-num" aria-hidden>
              06
            </span>
            <img
              src={droidImageSrc(droid.id, droid.imageLocal)}
              alt=""
              width={128}
              height={128}
              loading="eager"
            />
          </span>
        ) : null}
        <div className="tp-body">
          <div className="cm cm--compact">
            <div className="cm-top">
              <span className="cm-num">12</span>
              <span className="cm-of">{t('appearance.themeCardDemoOfTotal')}</span>
            </div>
            <div className="cm-cells" style={{ ['--cm-cols' as string]: cols }} aria-hidden>
              {cells}
            </div>
          </div>
          <span className="tp-btn">{t('appearance.previewCta')}</span>
        </div>
      </div>
      <span className="tcard-head">
        <span className="tcard-name">
          <span className="t-h2" style={{ display: 'block' }}>
            {name}
          </span>
          <span className="hint" style={{ display: 'block' }}>
            {desc}
          </span>
        </span>
        <span className="mark" aria-hidden />
      </span>
    </button>
  )
}

export function ThemeCardGroup({
  value,
  onChange,
}: {
  value: AppearanceTheme
  onChange: (theme: AppearanceTheme) => void
}) {
  const { t } = useTranslation()
  return (
    <div role="radiogroup" aria-label={t('appearance.themeGroup')}>
      {THEME_KEYS.map((key) => (
        <ThemeCard key={key} themeKey={key} selected={value === key} onSelect={onChange} />
      ))}
    </div>
  )
}
