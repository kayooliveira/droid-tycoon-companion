import { OnboardingThemeGateCards } from '../onboarding/OnboardingThemeGateCards'

/** `ajustes-aparencia.html` (capture-only). */
export function AppearanceGateView() {
  return (
    <>
      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">Tema</h2>
        </div>
        <OnboardingThemeGateCards />
      </section>
      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">Modo</h2>
        </div>
        <div className="seg" role="group" aria-label="Modo">
          <button type="button" aria-pressed>
            Sistema
          </button>
          <button type="button" aria-pressed={false}>
            Claro
          </button>
          <button type="button" aria-pressed={false}>
            Escuro
          </button>
        </div>
        <p className="hint" style={{ marginTop: 10 }}>
          Sistema segue o modo claro ou escuro do aparelho.
        </p>
      </section>
    </>
  )
}
