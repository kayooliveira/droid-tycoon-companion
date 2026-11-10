import { useSearchParams } from 'react-router-dom'
import { droidById, gameData } from '../../domain/gameData'
import { DroidImage } from '../DroidImage'
import { OnboardingThemeGateCards } from './OnboardingThemeGateCards'

const WELCOME_TRIO = [
  { id: 'r7', tier: 'galactic' as const },
  { id: 'lep', tier: 'kyber' as const },
  { id: 'bb-8', tier: 'rainbow' as const },
]

function StepsBar({ n, total = 4 }: { n: number; total?: number }) {
  return (
    <div className="steps" role="img" aria-label={`Passo ${n} de ${total}`}>
      {Array.from({ length: total }, (_, k) => (
        <i key={k} className={k < n ? 'on' : undefined} />
      ))}
    </div>
  )
}

function GateMeter29() {
  const cells = Array.from({ length: 40 }, (_, i) => {
    const step = i + 1
    const parts: string[] = []
    if (step <= 29) parts.push('done')
    if (step === 30) parts.push('cur')
    if (step % 5 === 0) parts.push('m5')
    return <i key={step} className={parts.join(' ') || undefined} />
  })
  return (
    <div className="cm cm--compact">
      <div className="cm-top">
        <span className="cm-num">29</span>
        <span className="cm-of">de 40</span>
        <span className="cm-label t-label">Ciclo 5</span>
      </div>
      <div className="cm-cells" aria-hidden>
        {cells}
      </div>
      <div className="cm-marks" aria-hidden>
        <span style={{ left: '23.75%' }}>10</span>
        <span style={{ left: '48.75%' }}>20</span>
        <span style={{ left: '73.75%' }}>30</span>
        <span style={{ left: '98.75%' }}>40</span>
      </div>
      <div className="cm-foot">
        <span className="t-meta">Prévia do renascimento #30</span>
      </div>
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
          return (
            <div key={id}>
              <DroidImage droid={droid} tier={tier} priority />
            </div>
          )
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
      <StepsBar n={1} />
      <h1
        className="t-display"
        style={{
          gridArea: 'auto',
          marginTop: 22,
          marginBottom: 8,
          fontSize: 'min(var(--title-size), 9vw)',
        }}
      >
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
      <StepsBar n={2} />
      <h1
        className="t-display"
        style={{
          gridArea: 'auto',
          marginTop: 22,
          marginBottom: 8,
          fontSize: 'min(var(--title-size), 9vw)',
        }}
      >
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
        <GateMeter29 />
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
      <StepsBar n={3} />
      <h1
        className="t-display"
        style={{
          gridArea: 'auto',
          marginTop: 22,
          marginBottom: 8,
          fontSize: 'min(var(--title-size), 9vw)',
        }}
      >
        Escolha o visual
      </h1>
      <p className="hint" style={{ marginBottom: 18 }}>
        Você pode mudar depois em Ajustes, Aparência.
      </p>
      <OnboardingThemeGateCards />
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
      <StepsBar n={4} />
      <h1
        className="t-display"
        style={{
          gridArea: 'auto',
          marginTop: 22,
          marginBottom: 8,
          fontSize: 'min(var(--title-size), 9vw)',
        }}
      >
        O que você ganha
      </h1>
      <p className="hint" style={{ marginBottom: 18 }}>
        Painel, listas de venda e export quando precisar.
      </p>
      <div className="row">
        <span className="row-ic" aria-hidden>
          <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
            <path d="M4 6h16v12H4z" />
          </svg>
        </span>
        <span className="row-main">
          <span className="dname" style={{ display: 'block' }}>
            Progresso
          </span>
          <span className="hint">Veja o próximo renascimento e o que falta.</span>
        </span>
      </div>
      <div className="row">
        <span className="row-ic" aria-hidden>
          <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
            <path d="M4 8h16v10H4z" />
          </svg>
        </span>
        <span className="row-main">
          <span className="dname" style={{ display: 'block' }}>
            Vender
          </span>
          <span className="hint">Saiba o que pode vender antes do renascimento.</span>
        </span>
      </div>
      <div className="row">
        <span className="row-ic" aria-hidden>
          <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
            <path d="M12 4v12M8 12l4 4 4-4" />
          </svg>
        </span>
        <span className="row-main">
          <span className="dname" style={{ display: 'block' }}>
            Exportar e compartilhar
          </span>
          <span className="hint">Compartilhe progresso ou exporte PDF do ciclo.</span>
        </span>
      </div>
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
  const stepId = ['welcome', 'cycle', 'progress', 'theme', 'features'][safeStep]!

  return (
    <div className="app" data-testid="onboarding-shell">
      <main className="scroll">
        <div data-testid={`onboarding-step-${stepId}`}>
          {safeStep === 0 ? <Step0 /> : null}
          {safeStep === 1 ? <Step1 /> : null}
          {safeStep === 2 ? <Step2 /> : null}
          {safeStep === 3 ? <Step3 /> : null}
          {safeStep === 4 ? <Step4 /> : null}
        </div>
      </main>
      <div className="toast-slot" hidden />
    </div>
  )
}
