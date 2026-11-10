import { useSearchParams } from 'react-router-dom'
import { droidById, gameData } from '../../domain/gameData'
import { DroidImage } from '../DroidImage'
import { ThemeCardGroup } from '../appearance/ThemeCard'
import { OnboardingCycleMeter } from '../../pages/OnboardingPage'
import { cn } from '../../lib/utils'

const WELCOME_TRIO = [
  { id: 'r7', tier: 'galactic' as const },
  { id: 'lep', tier: 'kyber' as const },
  { id: 'bb-8', tier: 'rainbow' as const },
]

function StepsBar({ active }: { active: number }) {
  return (
    <div className="steps" role="img" aria-label={`Passo ${active + 1} de 4`}>
      {Array.from({ length: 4 }, (_, i) => (
        <i key={i} className={i <= active ? 'on' : undefined} />
      ))}
    </div>
  )
}

function Step0() {
  return (
  <>
    <header className="top">
      <span className="top-brand">DroidDeck</span>
      <div className="top-aside" />
      <h1 className="t-display" style={{ fontSize: 'min(var(--title-size), 11vw)' }}>
        DroidDeck
      </h1>
    </header>
    <h2 className="t-h2" style={{ marginTop: 20, fontSize: 'calc(var(--h2-size) + 8px)' }}>
      Planeje o próximo renascimento
    </h2>
    <p className="hint" style={{ marginTop: 8 }}>
      Ciclo, inventário e o que vender, pensado pro celular enquanto você joga.
    </p>
    <div className="trio" style={{ margin: '28px 0 24px' }}>
      {WELCOME_TRIO.map(({ id, tier }) => {
        const droid = droidById.get(id)
        if (!droid) return null
        return <DroidImage key={id} droid={droid} tier={tier} priority />
      })}
    </div>
    <div className="stack">
      <button type="button" className="btn btn--primary" data-testid="onboarding-start">
        Começar
      </button>
      <button type="button" className="btn btn--ghost">
        Pular
      </button>
    </div>
    <p className="hint" style={{ marginTop: 20 }}>
      Feito por fãs. Sem vínculo com a Epic Games.
    </p>
  </>
)
}

function Step1() {
  return (
  <>
    <StepsBar active={0} />
    <h1 className="t-display" style={{ marginTop: 22, marginBottom: 8, fontSize: 'min(var(--title-size), 9vw)' }}>
      Escolha o Ciclo
    </h1>
    <p className="hint" style={{ marginBottom: 18 }}>
      Dá pra trocar o Ciclo depois em Ajustes.
    </p>
    <div className="opts" role="radiogroup" aria-label="Escolha o Ciclo">
      {gameData.cycles.map((c) => (
        <label key={c.id} className="opt" data-testid={`onboarding-cycle-${c.id}`}>
          <input type="radio" name="onb-path" readOnly checked={c.id === 'path-5'} />
          <span className="mark" aria-hidden />
          <span className="opt-t">
            Ciclo {c.id.replace('path-', '')}
            <small>40 renascimentos neste Ciclo</small>
          </span>
        </label>
      ))}
    </div>
    <div className="stack" style={{ marginTop: 24 }}>
      <button type="button" className="btn btn--primary">
        Continuar
      </button>
      <div className="grid2">
        <button type="button" className="btn btn--secondary">
          Voltar
        </button>
        <button type="button" className="btn btn--ghost">
          Pular
        </button>
      </div>
    </div>
  </>
)
}

function Step2() {
  return (
  <>
    <StepsBar active={1} />
    <h1 className="t-display" style={{ marginTop: 22, marginBottom: 8, fontSize: 'min(var(--title-size), 9vw)' }}>
      Onde você está neste Ciclo?
    </h1>
    <p className="hint" style={{ marginBottom: 18 }}>
      Quantos renascimentos você já terminou?
    </p>
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <span className="row-main">
        <span className="dname" style={{ display: 'block' }}>
          Renascimentos feitos
        </span>
        <span className="hint">Próximo renascimento: #30</span>
      </span>
      <div className="stepper">
        <button type="button" className="btn btn--icon btn--secondary" aria-label="Diminuir renascimentos">
          <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
            <path d="M5 12h14" />
          </svg>
        </button>
        <span className="stepper-val">29</span>
        <button type="button" className="btn btn--icon btn--primary" aria-label="Aumentar renascimentos">
          <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
    </div>
    <div className="chips" style={{ marginTop: 14 }}>
      <button type="button" className="chip" aria-pressed={false}>
        Começando
      </button>
      <button type="button" className="chip" aria-pressed>
        Meio do Ciclo
      </button>
    </div>
    <div style={{ marginTop: 18 }}>
      <OnboardingCycleMeter
        completed={29}
        cycleName="Ciclo 5"
        previewLabel="Prévia do renascimento #30"
      />
    </div>
    <div className="stack" style={{ marginTop: 24 }}>
      <button type="button" className="btn btn--primary">
        Continuar
      </button>
      <div className="grid2">
        <button type="button" className="btn btn--secondary">
          Voltar
        </button>
        <button type="button" className="btn btn--ghost">
          Pular
        </button>
      </div>
    </div>
  </>
)
}

function Step3() {
  return (
  <>
    <StepsBar active={2} />
    <h1 className="t-display" style={{ marginTop: 22, marginBottom: 8, fontSize: 'min(var(--title-size), 9vw)' }}>
      Escolha o visual
    </h1>
    <p className="hint" style={{ marginBottom: 18 }}>
      Você pode mudar depois em Ajustes, Aparência.
    </p>
    <ThemeCardGroup value="oficina" onChange={() => {}} />
    <div className="seg" role="group" aria-label="Modo" style={{ marginTop: 16 }}>
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
    <div className="stack" style={{ marginTop: 24 }}>
      <button type="button" className="btn btn--primary">
        Continuar
      </button>
      <button type="button" className="btn btn--ghost">
        Pular
      </button>
    </div>
  </>
)
}

function Step4() {
  return (
  <>
    <StepsBar active={3} />
    <h1 className="t-display" style={{ marginTop: 22, marginBottom: 8, fontSize: 'min(var(--title-size), 9vw)' }}>
      O que você ganha
    </h1>
    <p className="hint" style={{ marginBottom: 18 }}>
      Painel, listas de venda e export quando precisar.
    </p>
    {[
      ['Progresso', 'Veja o próximo renascimento e o que falta.'],
      ['Vender', 'Saiba o que pode vender antes do renascimento.'],
      ['Exportar e compartilhar', 'Compartilhe progresso ou exporte PDF do ciclo.'],
    ].map(([title, hint]) => (
      <div key={title} className="row">
        <span className="row-ic" aria-hidden>
          <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="8" />
          </svg>
        </span>
        <span className="row-main">
          <span className="dname" style={{ display: 'block' }}>
            {title}
          </span>
          <span className="hint">{hint}</span>
        </span>
      </div>
    ))}
    <label className="switch-row" style={{ marginTop: 8 }}>
      <span>
        <span style={{ display: 'block' }}>Registrar inventário</span>
      </span>
      <input type="checkbox" role="switch" defaultChecked readOnly />
    </label>
    <div className="stack" style={{ marginTop: 24 }}>
      <button type="button" className="btn btn--primary">
        Abrir início
      </button>
      <button type="button" className="btn btn--ghost">
        Voltar
      </button>
    </div>
  </>
)
}

export function OnboardingGateView() {
  const [params] = useSearchParams()
  const step = Number(params.get('e2e_onb_step') ?? '0')
  const safeStep = Number.isFinite(step) ? Math.max(0, Math.min(4, step)) : 0

  return (
    <div
      data-testid="onboarding-shell"
      className={cn(
        'app min-h-dvh flex flex-col pb-[env(safe-area-inset-bottom)]',
        safeStep !== 0 && 'pt-[env(safe-area-inset-top)]',
        safeStep === 0 && 'onboarding-welcome-shell',
      )}
    >
      <main
        className={cn(
          'scroll mx-auto w-full max-w-lg',
          safeStep === 0
            ? 'onboarding-welcome-scroll'
            : 'flex-1 flex flex-col min-h-0 px-4 sm:px-6 py-4',
        )}
      >
        <div data-testid={`onboarding-step-${['welcome', 'cycle', 'progress', 'theme', 'features'][safeStep]}`}>
          {safeStep === 0 ? <Step0 /> : null}
          {safeStep === 1 ? <Step1 /> : null}
          {safeStep === 2 ? <Step2 /> : null}
          {safeStep === 3 ? <Step3 /> : null}
          {safeStep === 4 ? <Step4 /> : null}
        </div>
      </main>
    </div>
  )
}
