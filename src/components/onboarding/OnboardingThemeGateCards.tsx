import { droidById } from '../../domain/gameData'
import { droidImageSrc } from '../../lib/images'

const THEMES = [
  { key: 'oficina', name: 'Oficina', desc: 'Plaquinhas, régua e linhas finas. Direto e técnico.', cols: 20, selected: true },
  { key: 'figurinhas', name: 'Figurinhas', desc: 'Álbum de figurinhas: cantos redondos e cores vivas.', cols: 10, selected: false },
  { key: 'cartaz', name: 'Cartaz', desc: 'Números gigantes, preto e branco, sem cantos.', cols: 20, selected: false },
] as const

function ThemePreview({ themeKey, cols }: { themeKey: string; cols: number }) {
  const droid = droidById.get('r7')
  const cells = Array.from({ length: cols }, (_, i) => (
    <i key={i} className={i < 12 ? 'done' : i === 12 ? 'cur' : undefined} />
  ))
  return (
    <div className="tp" data-theme={themeKey} data-theme-scope>
      {droid ? (
        <span className="dtile" data-tier="galactic">
          <span className="dtile-bg" aria-hidden />
          <span className="dtile-num" aria-hidden>
            06
          </span>
          <img src={droidImageSrc(droid.id, droid.imageLocal)} alt="" width={128} height={128} loading="eager" />
          <span className="dtile-q" aria-hidden>
            ?
          </span>
        </span>
      ) : null}
      <div className="tp-body">
        <div className="cm cm--compact">
          <div className="cm-top">
            <span className="cm-num">12</span>
            <span className="cm-of">de 20</span>
          </div>
          <div className="cm-cells" style={{ ['--cm-cols' as string]: cols }} aria-hidden>
            {cells}
          </div>
        </div>
        <span className="tp-btn">Concluir</span>
      </div>
    </div>
  )
}

export function OnboardingThemeGateCards() {
  return (
    <div role="radiogroup" aria-label="Tema">
      {THEMES.map((t) => (
        <button
          key={t.key}
          type="button"
          className="tcard"
          role="radio"
          aria-checked={t.selected}
          aria-label={`Tema ${t.name}`}
        >
          <ThemePreview themeKey={t.key} cols={t.cols} />
          <span className="tcard-head">
            <span className="tcard-name">
              <span className="t-h2" style={{ display: 'block' }}>
                {t.name}
              </span>
              <span className="hint" style={{ display: 'block' }}>
                {t.desc}
              </span>
            </span>
            <span className="mark" aria-hidden />
          </span>
        </button>
      ))}
    </div>
  )
}
