import { useEffect, useMemo, useState } from 'react'
import {
  IcGridView,
  IcListView,
  IcMinus,
  IcPlus,
} from '../components/inventoryIcons'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { droidById, gameData } from '../domain/gameData'
import { droidHasFutureNeedOnPath } from '../domain/sellCenter'
import { formatTierName } from '../domain/tiers'
import { formatBaseRarity, rarityLabel } from '../i18n/tierLabels'
import { useTierLabels } from '../i18n/useTierLabels'
import type { TierId } from '../domain/types'
import { DroidImage } from '../components/DroidImage'
import { DroidDetailRemoveButton, DroidDetailSheet } from '../components/droid/DroidDetailSheet'
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
import { isDesignGateCapture } from '../e2e/designGate'
import { isMockInventoryFixture, mockInventorySellable } from '../e2e/mockInventoryFixture'
import {
  gateFilteredMockUnits,
  gateInventoryFilterActive,
  GATE_RARITY_CHIP_INDEX,
  GATE_RARITY_CHIP_LABELS,
  GATE_TIER_CHIP_INDEX,
  GATE_TIER_CHIP_LABELS,
} from '../e2e/gateInventoryFixture'
import { InventoryAddGateSheet, InventoryRemoveGateSheet } from '../components/inventory/InventoryGateSheets'
import { droidMatchesQuery } from '../lib/droidNameMatch'
import {
  usePersistedInventoryFilters,
  type InventoryFilterMode,
  type InventoryFilters,
} from '../hooks/usePersistedInventoryFilters'
import { useAppStore } from '../store/useAppStore'

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

  const gateInv = gateInventoryFilterActive(inventory)

  const filtered = useMemo(() => {
    if (gateInv && filterMode === 'rarity') return gateFilteredMockUnits(inventory, 'rarity')
    if (gateInv && filterMode === 'tier') return gateFilteredMockUnits(inventory, 'tier')
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
      .sort(
        (a, b) =>
          inventory.findIndex((u) => u.id === a.id) - inventory.findIndex((u) => u.id === b.id),
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
    gateInv,
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
        <button
          type="button"
          className="btn btn--icon btn--primary"
          aria-label={t('inventory.addDroid')}
          data-testid="inventory-add-open"
          onClick={() => setAddOpen(true)}
        >
          <IcPlus />
        </button>
      }
    >
      <div className="inv-pin">
        <div className="inv-field-full" style={{ marginTop: 6 }}>
          <SearchInput
            placeholder={t('inventory.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t('inventory.search')}
          />
        </div>
        <div className="row2 inv-toolbar" style={{ marginTop: 12, gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <SegmentedControl
              ariaLabel={t('inventory.filterNeed')}
              value={filterMode}
              onChange={setFilterMode}
              options={[
                { value: 'all', label: t('inventory.allNeeds') },
                { value: 'rarity', label: t('inventory.filterRarity') },
                { value: 'tier', label: t('inventory.filterTier') },
              ]}
            />
          </div>
          <div className="row2 inv-view-toggle" role="group" aria-label={t('progress.viewMode')}>
            <button
              type="button"
              className={viewMode === 'grid' ? 'btn btn--icon btn--primary' : 'btn btn--icon btn--secondary'}
              aria-label={t('inventory.viewGrid')}
              aria-pressed={viewMode === 'grid'}
              onClick={() => setViewMode('grid')}
            >
              <IcGridView />
            </button>
            <button
              type="button"
              className={viewMode === 'list' ? 'btn btn--icon btn--primary' : 'btn btn--icon btn--secondary'}
              aria-label={t('inventory.viewList')}
              aria-pressed={viewMode === 'list'}
              onClick={() => setViewMode('list')}
            >
              <IcListView />
            </button>
          </div>
        </div>
        {filterMode === 'rarity' ? (
          <div style={{ marginTop: 12 }}>
            {gateInv ? (
              <div className="chips chips--scroll" role="group" aria-label={t('inventory.filterRarity')}>
                {GATE_RARITY_CHIP_LABELS.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    className="chip"
                    aria-pressed={i === GATE_RARITY_CHIP_INDEX}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
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
            )}
          </div>
        ) : null}
        {filterMode === 'tier' ? (
          <div style={{ marginTop: 12 }}>
            {gateInv ? (
              <div className="chips chips--scroll" role="group" aria-label={t('inventory.filterTier')}>
                {GATE_TIER_CHIP_LABELS.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    className="chip"
                    aria-pressed={i === GATE_TIER_CHIP_INDEX}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
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
            )}
          </div>
        ) : null}
        {filterMode === 'all' ? (
          <div style={{ marginTop: 12 }}>
            <SegmentedControl
              ariaLabel={t('inventory.filterNeed')}
              value={neededFilter}
              onChange={setNeededFilter}
              options={neededOptions}
            />
          </div>
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
      ) : viewMode === 'list' ? (
          <div className="inv-list" style={{ marginTop: 12 }} data-testid="inventory-collection">
            {filtered.map((unit) => {
              const droid = droidById.get(unit.droidId)
              if (!droid) return null
              const fixtureSell = mockInventorySellable(inventory, unit.id)
              const needed = droidHasFutureNeedOnPath(
                progress.pathId,
                progress.nextRebirth,
                unit.droidId,
              )
              const sellable = fixtureSell ?? !needed
              const openDetail = () =>
                setDetail({
                  unitId: unit.id,
                  droidId: unit.droidId,
                  tier: unit.tier,
                  quantity: unit.quantity,
                  sellable,
                })
              return (
                <div key={unit.id} className="item inv-list-item">
                  <button
                    type="button"
                    className="item-open"
                    data-testid="inventory-unit-card"
                    aria-label={`${droid.name} ${formatTierName(unit.tier, tierLabels)}`}
                    onClick={openDetail}
                  >
                    <DroidImage droid={droid} tier={unit.tier} size="sm" className="inv-list-tile" />
                    <span className="item-body">
                      <span className="dname" data-testid="inventory-unit-name">
                        {droid.name}
                      </span>
                      <span className="t-meta" data-testid="inventory-unit-badges">
                        {formatBaseRarity(droid.baseRarity, t)} · {formatTierName(unit.tier, tierLabels)}
                        {unit.quantity > 1 ? ` · ×${unit.quantity}` : ' · ×1'}
                      </span>
                      <SellBadge sellable={sellable} />
                    </span>
                  </button>
                  <button
                    type="button"
                    className="btn btn--icon btn--secondary"
                    aria-label={t('inventory.decreaseQuantity')}
                    onClick={() => {
                      if (unit.quantity <= 1) {
                        setRemoveTarget({
                          unitId: unit.id,
                          name: droid.name,
                          tier: formatTierName(unit.tier, tierLabels),
                        })
                      } else {
                        updateInventoryUnit(unit.id, { quantity: unit.quantity - 1 })
                      }
                    }}
                  >
                    <IcMinus />
                  </button>
                  <button
                    type="button"
                    className="btn btn--icon btn--primary"
                    aria-label={t('inventory.increaseQuantity')}
                    onClick={() => updateInventoryUnit(unit.id, { quantity: unit.quantity + 1 })}
                  >
                    <IcPlus />
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="grid2 inv-grid" style={{ marginTop: 18 }} data-testid="inventory-collection">
            {filtered.map((unit) => {
              const droid = droidById.get(unit.droidId)
              if (!droid) return null
              const fixtureSell = mockInventorySellable(inventory, unit.id)
              const needed = droidHasFutureNeedOnPath(
                progress.pathId,
                progress.nextRebirth,
                unit.droidId,
              )
              const sellable = fixtureSell ?? !needed
              return (
                <button
                  key={unit.id}
                  type="button"
                  data-testid="inventory-unit-card"
                  className="dcard"
                  aria-label={`${droid.name} ${formatTierName(unit.tier, tierLabels)}`}
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
                  <DroidImage droid={droid} tier={unit.tier} quantity={unit.quantity > 1 ? unit.quantity : undefined} />
                  <span className="dname" style={{ display: 'block' }} data-testid="inventory-unit-name">
                    {droid.name}
                  </span>
                  <span className="t-meta dmeta" style={{ display: 'block' }} data-testid="inventory-unit-badges">
                    {formatBaseRarity(droid.baseRarity, t)} · {formatTierName(unit.tier, tierLabels)}
                  </span>
                  <SellBadge sellable={sellable} />
                </button>
              )
            })}
          </div>
        )}

      <DroidDetailSheet
        open={detail != null && !(isDesignGateCapture() && removeTarget)}
        onClose={() => setDetail(null)}
        droidId={detail?.droidId ?? null}
        tier={detail?.tier ?? 'default'}
        quantity={detail?.quantity}
        sellable={detail?.sellable}
      >
        {detail &&
        (!isMockInventoryFixture(inventory) ||
          isDesignGateCapture()) ? (
          <div className="stack" style={{ marginTop: 12 }} data-testid="inventory-unit-actions">
            <div className="row2" style={{ justifyContent: 'space-between' }}>
              <span className="dname">{t('inventory.quantity')}</span>
              <QuantityStepper
                compact
                value={detail.quantity}
                onChange={(quantity) => {
                  if (!isDesignGateCapture()) {
                    updateInventoryUnit(detail.unitId, { quantity })
                  }
                  setDetail((d) => (d ? { ...d, quantity } : d))
                }}
                decreaseLabel={t('inventory.decreaseQuantity')}
                increaseLabel={t('inventory.increaseQuantity')}
              />
            </div>
            <DroidDetailRemoveButton
              label={t('a11y.removeUnit')}
              testId={`inventory-remove-${detail.unitId}`}
              onClick={() => {
                const droid = droidById.get(detail.droidId)
                setRemoveTarget({
                  unitId: detail.unitId,
                  name: droid?.name ?? detail.droidId,
                  tier: formatTierName(detail.tier, tierLabels),
                })
              }}
            />
          </div>
        ) : null}
      </DroidDetailSheet>

      {isDesignGateCapture() && addOpen ? (
        <InventoryAddGateSheet onClose={() => setAddOpen(false)} />
      ) : null}
      <Sheet
        open={addOpen && !isDesignGateCapture()}
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

      {isDesignGateCapture() && removeTarget ? (
        <InventoryRemoveGateSheet onClose={() => setRemoveTarget(null)} />
      ) : null}
      <Sheet
        open={Boolean(removeTarget) && !isDesignGateCapture()}
        onClose={() => setRemoveTarget(null)}
        testId="inventory-remove-modal"
      >
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
