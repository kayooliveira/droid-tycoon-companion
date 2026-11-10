import { useTranslation } from 'react-i18next'
import { droidById } from '../../domain/gameData'
import { DroidImage } from '../DroidImage'

function RuleIcon({ kind }: { kind: 'tier' | 'random' | 'unlock' }) {
  if (kind === 'tier') {
    return (
      <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
        <circle cx="8.5" cy="12" r="5" />
        <circle cx="15.5" cy="12" r="5" />
      </svg>
    )
  }
  if (kind === 'random') {
    return (
      <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
        <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8z" />
      </svg>
    )
  }
  return (
    <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
      <rect x="5" y="10.5" width="14" height="10" rx="1" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </svg>
  )
}

const partialTag = (label: string) => (
  <span className="tag tag--mute">
    <i className="tag-sq" aria-hidden />
    <svg className="ic" width={14} height={14} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
    {label}
  </span>
)

function RecipeRow({
  ingredients,
  resultId,
  label,
  partialLabel,
}: {
  ingredients: Array<{ id: string; qty?: number }>
  resultId: string
  label: string
  partialLabel?: string
}) {
  const result = droidById.get(resultId)
  return (
    <div className="row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
      <div className="row2" style={{ flexWrap: 'nowrap', gap: 6, width: '100%' }}>
        {ingredients.map((ing, i) => {
          const droid = droidById.get(ing.id)
          if (!droid) return null
          const q = ing.qty ?? 1
          return (
            <span key={`${ing.id}-${i}`} style={{ display: 'contents' }}>
              {i > 0 ? (
                <span aria-hidden style={{ alignSelf: 'center' }}>
                  <svg className="ic" width={16} height={16} viewBox="0 0 24 24" aria-hidden>
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              ) : null}
              <div style={{ width: 48 }}>
                <DroidImage droid={droid} tier="default" size="sm" priority />
              </div>
              {q > 1 ? (
                <span className="t-label" style={{ alignSelf: 'center' }}>
                  ×{q}
                </span>
              ) : null}
            </span>
          )
        })}
        <span className="t-label" style={{ alignSelf: 'center', marginLeft: 2 }}>
          vira
        </span>
        <div style={{ width: 48 }}>
          {result ? (
            <DroidImage droid={result} tier="default" size="sm" missing priority />
          ) : null}
        </div>
      </div>
      <span className="dname">{label}</span>
      {partialLabel ? partialTag(partialLabel) : null}
    </div>
  )
}

export function FusionGateView() {
  const { t } = useTranslation()
  const partial = t('confidence.partial')
  const partialBadge = t('fusion.partialBadge')

  return (
    <>
      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">{t('fusion.rulesTitle')}</h2>
        </div>
        <div className="row">
          <span className="row-ic" aria-hidden>
            <RuleIcon kind="tier" />
          </span>
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              {t('fusion.rules.tierUp')}
            </span>
            <span className="hint">{partial}</span>
          </span>
        </div>
        <div className="row">
          <span className="row-ic" aria-hidden>
            <RuleIcon kind="random" />
          </span>
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              {t('fusion.rules.random')}
            </span>
            <span className="hint">{partial}</span>
          </span>
        </div>
        <div className="row">
          <span className="row-ic" aria-hidden>
            <RuleIcon kind="unlock" />
          </span>
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              {t('fusion.rules.unlock')}
            </span>
            <span className="hint">{partial}</span>
          </span>
        </div>
        <div className="row">
          <span className="row-main">
            <span className="hint">{t('fusion.resultTierRule')}</span>
          </span>
        </div>
        <p className="hint" style={{ marginTop: 8 }}>
          {t('fusion.rulesFootnote')}
        </p>
      </section>

      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">{t('fusion.helpsNext')}</h2>
        </div>
        <RecipeRow
          ingredients={[
            { id: 'cb', qty: 1 },
            { id: 'bb', qty: 1 },
            { id: 'mouse', qty: 1 },
          ]}
          resultId="r7"
          label="R7"
          partialLabel={partialBadge}
        />
      </section>

      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">{t('fusion.recipes')}</h2>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div className="field-wrap">
            <svg className="ic" width={20} height={20} viewBox="0 0 24 24" aria-hidden>
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m20 20-4.9-4.9" />
            </svg>
            <input
              className="field"
              type="search"
              placeholder={t('fusion.search')}
              defaultValue=""
              aria-label={t('fusion.search')}
              readOnly
            />
          </div>
        </div>
        <RecipeRow
          ingredients={[
            { id: 'r2', qty: 2 },
            { id: 'b2-super', qty: 1 },
          ]}
          resultId="opt-ar"
          label="OPT-AR"
          partialLabel={partialBadge}
        />
        <RecipeRow
          ingredients={[
            { id: 'kx', qty: 1 },
            { id: 'ig', qty: 1 },
            { id: 'ric', qty: 1 },
          ]}
          resultId="riv-3t"
          label="RIV-3T"
          partialLabel={partialBadge}
        />
        <RecipeRow
          ingredients={[
            { id: 'mouse', qty: 2 },
            { id: 'pit', qty: 1 },
          ]}
          resultId="whl-ex"
          label="WHL-EX"
          partialLabel={partialBadge}
        />
      </section>
    </>
  )
}
