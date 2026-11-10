import { useEffect, useMemo, useState } from 'react'
import { ListBullets, Plus, SquaresFour } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { droidById, gameData } from '../domain/gameData'
import { droidHasFutureNeedOnPath } from '../domain/sellCenter'
import { formatTierName } from '../domain/tiers'
import { formatBaseRarity, rarityLabel } from '../i18n/tierLabels'
import { useTierLabels } from '../i18n/useTierLabels'
import type { TierId } from '../domain/types'
import { DroidImage } from '../components/DroidImage'
import { DroidDetailSheet } from '../components/droid/DroidDetailSheet'
import { TabScrollLayout } from '../components/layout/TabScrollLayout'
import { Button } from '../components/ui/Button'
import { ChipRadioGroup } from '../components/ui/ChipRadioGroup'
import { InsetGroup } from '../components/ui/InsetGroup'
import { QuantityStepper } from '../components/ui/QuantityStepper'
import { SearchInput } from '../components/ui/SearchInput'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { Sheet } from '../components/ui/Sheet'
import { SellBadge } from '../components/ui/SellBadge'
import { useToast } from '../components/ToastProvider'
import { droidMatchesQuery } from '../lib/droidNameMatch'
import { cn } from '../lib/utils'
import {
  usePersistedInventoryFilters,
  type InventoryFilterMode,
  type InventoryFilters,
} from '../hooks/usePersistedInventoryFilters'
import { useAppStore } from '../store/useAppStore'
import { uiIconProps } from '../components/ui/iconStyle'

export function InventoryPage() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const tierLabels = useTierLabels()
  const inventory = useAppStore((s) => s.inventory)
  const progress = useAppStore((s) => s.progress)
  const addInventoryUnit = useAppStore((s) => s.addInventoryUnit)
  const updateInventoryUnit = useAppStore((s) => s.updateInventoryUnit)
  const removeInventoryUnit = useAppStore((s) => s.removeInventoryUnit)
  const trackInventory = useAppStore((s) => s.settings.trackInventory)
  const { push } = useToast()

  const [filters, setFilters] = usePersistedInventoryFilters()
  const { search, filterMode, rarityFilter, tierFilter, neededFilter, viewMode } = filters

  useEffect(() => {
    const mode = params.get('e2e_inv_filter')
    if (mode === 'rarity' || mode === 'tier' || mode === 'all') {
      setFilters((f) => ({ ...f, filterMode: mode }))
    }
    if (params.get('e2e_inv_view') === 'list') {
      setFilters((f) => ({ ...f, viewMode: 'list' }))
    }
  }, [params, setFilters])
  const setSearch = (search: string) => setFilters((f) => ({ ...f, search }))
  const setFilterMode = (filterMode: InventoryFilterMode) =>
    setFilters((f) => ({
      ...f,
      filterMode,
      rarityFilter: filterMode === 'rarity' ? f.rarityFilter : 'all',
      tierFilter: filterMode === 'tier' ? f.tierFilter : 'all',
    }))
  const setRarityFilter = (rarityFilter: string) => setFilters((f) => ({ ...f, rarityFilter }))
  const setTierFilter = (tierFilter: string) => setFilters((f) => ({ ...f, tierFilter }))
  const setNeededFilter = (neededFilter: InventoryFilters['neededFilter']) =>
    setFilters((f) => ({ ...f, neededFilter }))
  const setViewMode = (viewMode: InventoryFilters['viewMode']) =>
    setFilters((f) => ({ ...f, viewMode }))

  const [addOpen, setAddOpen] = useState(false)
  const [pickerSearch, setPickerSearch] = useState('')
  const [newDroidId, setNewDroidId] = useState(gameData.droids[0]?.id ?? '')
  const [newTier, setNewTier] = useState<TierId>('default')
  const [newQty, setNewQty] = useState(1)
  const [removeTarget, setRemoveTarget] = useState<{
    unitId: string
    name: string
    tier: string
  } | null>(null)
  const [detail, setDetail] = useState<{
    unitId: string
    droidId: string
    tier: TierId
    quantity: number
    sellable: boolean
  } | null>(null)

  const rarityOptions = useMemo(
    () => [
      { value: 'all', label: t('inventory.allRaritiesShort') },
      ...gameData.baseRarities.map((r) => ({
        value: r.id,
        label: rarityLabel(t, r.id),
      })),
    ],
    [t],
  )

  const tierOptions = useMemo(
    () => [
      { value: 'all', label: t('inventory.allTiersShort') },
      ...gameData.rarities.map((tier) => ({
        value: tier.id,
        label: formatTierName(tier.id, tierLabels),
      })),
    ],
    [t, tierLabels],
  )

  const tierPickOptions = useMemo(
    () =>
      gameData.rarities.map((tier) => ({
        value: tier.id as TierId,
        label: formatTierName(tier.id, tierLabels),
      })),
    [tierLabels],
  )

  const neededOptions = useMemo(
    () => [
      { value: 'all' as const, label: t('inventory.allNeeds') },
      { value: 'needed' as const, label: t('inventory.neededFilter') },
      { value: 'not-needed' as const, label: t('inventory.notNeededFilter') },
    ],
    [t],
  )

  const filtered = useMemo(() => {
    return inventory
      .filter((u) => {
        const d = droidById.get(u.droidId)
        if (search && d && !droidMatchesQuery(search, d.name, d.id)) return false
        if (filterMode === 'rarity' && rarityFilter !== 'all' && d?.baseRarity.toLowerCase() !== rarityFilter)
          return false
        if (filterMode === 'tier' && tierFilter !== 'all' && u.tier !== tierFilter) return false
        const needed = droidHasFutureNeedOnPath(progress.pathId, progress.nextRebirth, u.droidId)
        if (neededFilter === 'needed' && !needed) return false
        if (neededFilter === 'not-needed' && needed) return false
        return true
      })
      .sort((a, b) =>
        (droidById.get(a.droidId)?.name ?? '').localeCompare(droidById.get(b.droidId)?.name ?? ''),
      )
  }, [
    inventory,
    search,
    filterMode,
    rarityFilter,
    tierFilter,
    neededFilter,
    progress.pathId,
    progress.nextRebirth,
  ])

  const pickerDroids = useMemo(() => {
    const q = pickerSearch.toLowerCase()
    return gameData.droids
      .filter((d) => !q || droidMatchesQuery(q, d.name, d.id))
      .slice(0, 40)
  }, [pickerSearch])

  if (!trackInventory) {
    return (
      <TabScrollLayout title={t('inventory.title')} testId="inventory-page">
        <InsetGroup>
          <div className="row">
            <div className="row-main">
              <span className="row-title">{t('inventory.trackingOff')}</span>
              <span className="hint">{t('inventory.trackingOffHint')}</span>
            </div>
          </div>
        </InsetGroup>
      </TabScrollLayout>
    )
  }

  return (
    <TabScrollLayout
      title={t('inventory.title')}
      testId="inventory-page"
      headerExtra={
        <Button
          size="sm"
          iconOnly
          aria-label={t('inventory.addDroid')}
          data-testid="inventory-add-open"
          onClick={() => setAddOpen(true)}
        >
          <Plus {...uiIconProps} />
        </Button>
      }
    >
      <div className="inv-pin">
        <div className="field-wrap">
          <SearchInput
            placeholder={t('inventory.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t('inventory.search')}
          />
        </div>
        <div className="grid2">
          <SegmentedControl
            compact
            ariaLabel={t('inventory.filterNeed')}
            value={filterMode}
            onChange={setFilterMode}
            options={[
              { value: 'all', label: t('inventory.allNeeds') },
              { value: 'rarity', label: t('inventory.filterRarity') },
              { value: 'tier', label: t('inventory.filterTier') },
            ]}
          />
          <div className="seg" role="group" aria-label={t('progress.viewMode')}>
            <button
              type="button"
              className={cn( viewMode === 'grid' && '')}
              aria-label={t('inventory.viewGrid')}
              aria-pressed={viewMode === 'grid'}
              onClick={() => setViewMode('grid')}
            >
              <SquaresFour {...uiIconProps} />
            </button>
            <button
              type="button"
              className={cn( viewMode === 'list' && '')}
              aria-label={t('inventory.viewList')}
              aria-pressed={viewMode === 'list'}
              onClick={() => setViewMode('list')}
            >
              <ListBullets {...uiIconProps} />
            </button>
          </div>
        </div>
        {filterMode === 'rarity' ? (
          <div className="px-4 pb-2">
            <ChipRadioGroup
              ariaLabel={t('inventory.filterRarity')}
              testId="inventory-rarity-chips"
              scrollX
              value={rarityFilter}
              onChange={setRarityFilter}
              options={rarityOptions}
            />
          </div>
        ) : null}
        {filterMode === 'tier' ? (
          <div className="px-4 pb-2">
            <ChipRadioGroup
              ariaLabel={t('inventory.filterTier')}
              testId="inventory-tier-chips"
              scrollX
              value={tierFilter}
              onChange={setTierFilter}
              options={tierOptions}
            />
          </div>
        ) : null}
        {filterMode === 'all' ? (
          <SegmentedControl
            compact
            className="!mx-4 !mb-3"
            ariaLabel={t('inventory.filterNeed')}
            value={neededFilter}
            onChange={setNeededFilter}
            options={neededOptions}
          />
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <InsetGroup>
          <div className="row">
            <div className="row-main">
              <span className="row-title">{t('inventory.emptyHint')}</span>
            </div>
          </div>
          <button type="button" className="row" onClick={() => setAddOpen(true)}>
            <span className="row-title text-[var(--ui-accent-fill)]">{t('inventory.addDroid')}</span>
          </button>
        </InsetGroup>
      ) : (
        <div
          className={cn('collection-grid', viewMode === 'list' && 'collection-list')}
          data-testid="inventory-collection"
        >
          {filtered.map((unit) => {
            const droid = droidById.get(unit.droidId)
            if (!droid) return null
            const needed = droidHasFutureNeedOnPath(progress.pathId, progress.nextRebirth, unit.droidId)
            const sellable = !needed
            return (
              <button
                key={unit.id}
                type="button"
                data-testid="inventory-unit-card"
                className="collect-card"
                onClick={() =>
                  setDetail({
                    unitId: unit.id,
                    droidId: unit.droidId,
                    tier: unit.tier,
                    quantity: unit.quantity,
                    sellable,
                  })
                }
              >
                <div className="collect-art">
                  <DroidImage
                    droid={droid}
                    tier={unit.tier}
                    className="!h-full !w-full rounded-none"
                  />
                  {unit.quantity > 1 ? (
                    <span className="qty-badge">×{unit.quantity}</span>
                  ) : null}
                </div>
                <div className="collect-body">
                  <span className="dname" data-testid="inventory-unit-name">
                    {droid.name}
                  </span>
                  <span className="collect-meta" data-testid="inventory-unit-badges">
                    {formatBaseRarity(droid.baseRarity, t)} · {formatTierName(unit.tier, tierLabels)}
                  </span>
                  <span className="collect-meta ">
                    <SellBadge sellable={sellable} />
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      <DroidDetailSheet
        open={detail != null}
        onClose={() => setDetail(null)}
        droidId={detail?.droidId ?? null}
        tier={detail?.tier ?? 'default'}
        quantity={detail?.quantity}
        sellable={detail?.sellable}
      >
        {detail ? (
          <div className="mt-4 space-y-3" data-testid="inventory-unit-actions">
            <QuantityStepper
              compact
              value={detail.quantity}
              onChange={(quantity) => {
                updateInventoryUnit(detail.unitId, { quantity })
                setDetail((d) => (d ? { ...d, quantity } : d))
              }}
              decreaseLabel={t('inventory.decreaseQuantity')}
              increaseLabel={t('inventory.increaseQuantity')}
            />
            <Button
              variant="ghost"
              className="w-full"
              data-testid={`inventory-remove-${detail.unitId}`}
              onClick={() => {
                const droid = droidById.get(detail.droidId)
                setRemoveTarget({
                  unitId: detail.unitId,
                  name: droid?.name ?? detail.droidId,
                  tier: formatTierName(detail.tier, tierLabels),
                })
              }}
            >
              {t('a11y.removeUnit')}
            </Button>
          </div>
        ) : null}
      </DroidDetailSheet>

      <Sheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        testId="inventory-add-modal"
        aboveTabBar
        title={t('inventory.modalTitle')}
        headerLabel={t('inventory.modalTitle')}
      >
        <div className="stack">
          <SearchInput
            placeholder={t('inventory.searchDroids')}
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.target.value)}
            aria-label={t('inventory.searchDroids')}
          />
          <div className="add-droid-picks">
            {pickerDroids.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setNewDroidId(d.id)}
                className="pick"
                aria-pressed={newDroidId === d.id}
              >
                <DroidImage droid={d} tier="default" size="sm" className="!w-[44px] !h-[44px]" />
                <span className="dname">{d.name}</span>
              </button>
            ))}
          </div>
          <div className="add-droid-tier-block">
            <span className="t-label">{t('inventory.pickTier')}</span>
            <ChipRadioGroup
              ariaLabel={t('inventory.pickTier')}
              testId="inventory-add-tier-chips"
              value={newTier}
              onChange={setNewTier}
              options={tierPickOptions}
            />
          </div>
          <QuantityStepper
            label={t('inventory.quantity')}
            value={newQty}
            onChange={setNewQty}
            decreaseLabel={t('inventory.decreaseQuantity')}
            increaseLabel={t('inventory.increaseQuantity')}
            testId="inventory-add-qty"
          />
          <button
            type="button"
            className="btn btn--primary btn--block"
            data-testid="inventory-add-confirm"
            onClick={() => {
              addInventoryUnit(newDroidId, newTier, newQty)
              const name = droidById.get(newDroidId)?.name ?? newDroidId
              push(t('inventory.added', { name }), { variant: 'success' })
              setAddOpen(false)
              setNewQty(1)
            }}
          >
            {t('inventory.add')}
          </button>
        </div>
      </Sheet>

      <Sheet open={Boolean(removeTarget)} onClose={() => setRemoveTarget(null)} testId="inventory-remove-modal">
        <h2 className="text-[20px] font-bold mb-3">{t('inventory.removeConfirmTitle')}</h2>
        {removeTarget ? (
          <p className="text-sm text-ui-secondary text-pretty mb-4">
            {t('inventory.removeConfirmBody', {
              name: removeTarget.name,
              tier: removeTarget.tier,
            })}
          </p>
        ) : null}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            data-testid="inventory-remove-cancel"
            onClick={() => setRemoveTarget(null)}
          >
            {t('path.cancel')}
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            data-testid="inventory-remove-confirm"
            onClick={() => {
              if (!removeTarget) return
              const { name, unitId } = removeTarget
              removeInventoryUnit(unitId)
              push(t('inventory.removed', { name }), { variant: 'info' })
              setRemoveTarget(null)
              setDetail(null)
            }}
          >
            {t('common.confirm')}
          </Button>
        </div>
      </Sheet>

      <div aria-hidden />
    </TabScrollLayout>
  )
}
