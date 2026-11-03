import { Check, Moon, Sun } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../components/ToastProvider'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Chip } from '../components/ui/Chip'
import { EmptyState } from '../components/ui/EmptyState'
import { IconButton } from '../components/ui/IconButton'
import { ListRow } from '../components/ui/ListRow'
import { Modal } from '../components/ui/Modal'
import { SearchInput } from '../components/ui/SearchInput'
import { SectionHeader } from '../components/ui/SectionHeader'
import { TierBadge } from '../components/ui/TierBadge'
import { TierSurface } from '../components/ui/TierSurface'
import { TIER_SHOWCASE_IDS } from '../components/ui/tierVisuals'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { SkeletonStack } from '../components/ui/Skeleton'
import { Switch } from '../components/ui/Switch'
import { uiIconProps } from '../components/ui/iconStyle'
import { applyTheme, useAppStore } from '../store/useAppStore'
import { useMemo, useState } from 'react'

const SURFACE_SWATCHES = [
  { key: 'bg', className: 'bg-ui-bg border border-ui' },
  { key: 'raised', className: 'bg-ui-raised border border-ui' },
  { key: 'elevated', className: 'bg-ui-elevated border border-ui' },
  { key: 'fg', className: 'bg-ui-fg' },
] as const

const STATUS_SWATCHES = [
  {
    key: 'accent',
    className: 'bg-ui-accent-solid',
    textClass: 'text-on-accent-solid',
  },
  {
    key: 'success',
    className: 'bg-ui-success-solid',
    textClass: 'text-on-success-solid',
  },
  {
    key: 'warn',
    className: 'bg-ui-warn-solid',
    textClass: 'text-on-warn-solid',
  },
  {
    key: 'danger',
    className: 'bg-ui-danger-solid',
    textClass: 'text-on-danger-solid',
  },
] as const

export function DesignSystemPage() {
  const { t } = useTranslation()
  const { push } = useToast()
  const theme = useAppStore((s) => s.settings.theme)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [switchOn, setSwitchOn] = useState(true)
  const [segment, setSegment] = useState<'a' | 'b'>('a')

  const setTheme = (next: 'dark' | 'light') => {
    updateSettings({ theme: next })
    applyTheme(next)
  }

  const spacingBars = useMemo(
    () =>
      [1, 2, 3, 4, 6, 8].map((n) => ({
        n,
        width: `var(--space-${n})`,
      })),
    [],
  )

  return (
    <div
      className="min-h-dvh bg-ui-bg text-ui-fg pb-16"
      data-testid="design-system-page"
    >
      <header className="sticky top-0 z-sticky border-b border-ui bg-ui-elevated px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div>
            <h1 className="text-ds-display-sm">{t('designSystem.title')}</h1>
            <p className="text-ds-sm text-ui-muted">{t('designSystem.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <IconButton
              label={t('designSystem.themeDark')}
              variant={theme === 'dark' ? 'solid' : 'soft'}
              onClick={() => setTheme('dark')}
              data-testid="design-theme-dark"
            >
              <Moon {...uiIconProps} />
            </IconButton>
            <IconButton
              label={t('designSystem.themeLight')}
              variant={theme === 'light' ? 'solid' : 'soft'}
              onClick={() => setTheme('light')}
              data-testid="design-theme-light"
            >
              <Sun {...uiIconProps} />
            </IconButton>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-6">
        <section data-testid="design-section-colors">
          <SectionHeader title={t('designSystem.colorsTitle')} />
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SURFACE_SWATCHES.map((s) => (
              <div key={s.key} className="space-y-1">
                <div className={`h-12 rounded-xl ${s.className}`} />
                <p className="text-ds-xs text-ui-muted">{t(`designSystem.swatch.${s.key}`)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATUS_SWATCHES.map((s) => (
              <div key={s.key} className="space-y-1">
                <div
                  className={`flex h-12 items-center justify-center rounded-xl text-ds-xs font-semibold ${s.className} ${s.textClass}`}
                >
                  {t('designSystem.swatchOnColor')}
                </div>
                <p className="text-ds-xs text-ui-muted">{t(`designSystem.swatch.${s.key}`)}</p>
              </div>
            ))}
          </div>
        </section>

        <section data-testid="design-section-tier-showcase">
          <SectionHeader title={t('designSystem.tiersTitle')} />
          <p className="text-ds-xs text-ui-muted -mt-1 mb-3">{t('designSystem.tierShowcaseHint')}</p>
          <div
            className="mt-3 flex flex-wrap gap-2"
            data-testid="design-tier-badges-row"
          >
            {TIER_SHOWCASE_IDS.map((tier) => (
              <TierBadge key={tier} tier={tier} testId={`design-tier-badge-${tier}`}>
                {t(`tier.${tier}`)}
              </TierBadge>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2" data-testid="design-tier-surfaces-grid">
            {TIER_SHOWCASE_IDS.map((tier) => (
              <TierSurface
                key={tier}
                tier={tier}
                title={t(`tier.${tier}`)}
                testId={`design-tier-surface-${tier}`}
              >
                {t('designSystem.tierSurfaceSample')}
              </TierSurface>
            ))}
          </div>
        </section>

        <section data-testid="design-section-type">
          <SectionHeader title={t('designSystem.typeTitle')} />
          <Card className="mt-3 space-y-3">
            <p className="text-ds-display-md">{t('designSystem.sampleDisplay')}</p>
            <p className="text-ds-lg font-semibold">{t('designSystem.sampleHeading')}</p>
            <p className="text-ds-base">{t('designSystem.sampleBody')}</p>
            <p className="text-ds-sm text-ui-muted">{t('designSystem.sampleCaption')}</p>
          </Card>
        </section>

        <section data-testid="design-section-spacing">
          <SectionHeader title={t('designSystem.spacingTitle')} />
          <div className="mt-3 flex flex-wrap items-end gap-4">
            {spacingBars.map(({ n, width }) => (
              <div key={n} className="flex flex-col items-center gap-1">
                <div
                  className="h-8 rounded bg-ui-accent/40"
                  style={{ width }}
                />
                <span className="text-ds-xs text-ui-muted">{n}</span>
              </div>
            ))}
          </div>
        </section>

        <section data-testid="design-section-components">
          <SectionHeader title={t('designSystem.componentsTitle')} />
          <div className="mt-3 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">{t('designSystem.btnPrimary')}</Button>
              <Button variant="secondary">{t('designSystem.btnSecondary')}</Button>
              <Button variant="accent">{t('designSystem.btnAccent')}</Button>
              <Button variant="danger">{t('designSystem.btnDanger')}</Button>
              <Button variant="ghost">{t('designSystem.btnGhost')}</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="success">{t('status.ready')}</Badge>
              <Badge tone="warn">{t('status.owned')}</Badge>
              <Badge tone="danger">{t('status.missing')}</Badge>
              <Chip tone="info">{t('designSystem.chipLabel')}</Chip>
            </div>
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              clearLabel={t('progress.search.clear')}
              placeholder={t('designSystem.searchPlaceholder')}
              aria-label={t('designSystem.searchPlaceholder')}
            />
            <SegmentedControl
              ariaLabel={t('designSystem.segmentLabel')}
              value={segment}
              onChange={setSegment}
              options={[
                { value: 'a', label: t('designSystem.segmentA') },
                { value: 'b', label: t('designSystem.segmentB') },
              ]}
            />
            <Switch
              label={t('designSystem.switchLabel')}
              checked={switchOn}
              onChange={setSwitchOn}
            />
            <ListRow
              title={t('designSystem.listTitle')}
              subtitle={t('designSystem.listSubtitle')}
              trailing={<Badge tone="success">{t('status.ready')}</Badge>}
            />
            <EmptyState
              title={t('designSystem.emptyTitle')}
              description={t('designSystem.emptyBody')}
              action={
                <Button size="sm" variant="secondary">
                  {t('designSystem.emptyAction')}
                </Button>
              }
            />
            <Card variant="glass">
              <SkeletonStack lines={2} />
            </Card>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                data-testid="design-open-modal"
                onClick={() => setModalOpen(true)}
              >
                {t('designSystem.openModal')}
              </Button>
              <Button
                size="sm"
                icon={<Check {...uiIconProps} />}
                data-testid="design-show-toast"
                onClick={() =>
                  push(t('designSystem.toastSample'), { variant: 'success' })
                }
              >
                {t('designSystem.showToast')}
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('designSystem.modalTitle')}
        testId="design-system-modal"
      >
        <p className="text-ds-sm text-ui-secondary text-pretty">{t('designSystem.modalBody')}</p>
      </Modal>
    </div>
  )
}
