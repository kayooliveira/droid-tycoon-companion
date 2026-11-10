import type { Droid } from '../../domain/types'
import type { TierId } from '../../domain/types'
import { DroidImage } from '../DroidImage'
import { RequirementInventoryControls } from '../RequirementInventoryControls'
import { SellBadge } from '../ui/SellBadge'

export function ProgressDroidRequirementRow({
  droid,
  tier,
  subMeta,
  sellable,
  owned,
  needed,
  trackInventory,
  onOpenDroid,
}: {
  droid: Droid
  tier: TierId
  subMeta: string
  sellable: boolean
  owned: number
  needed: number
  trackInventory: boolean
  onOpenDroid: () => void
}) {
  return (
    <div className="row item item">
      <button
        type="button"
        className="item-open"
        data-testid="progress-droid-row-open"
        onClick={onOpenDroid}
      >
        <DroidImage droid={droid} tier={tier} size="sm" className="!h-[50px] !w-[50px] rounded-[11px]" />
        <span className="row-main">
          <span className="dname row-title">{droid.name}</span>
          <span className="hint ">
            <span className="t-meta">{subMeta}</span>
            <SellBadge sellable={sellable} />
          </span>
        </span>
      </button>
      {trackInventory ? (
        <RequirementInventoryControls
          droidId={droid.id}
          droidName={droid.name}
          tier={tier}
          ownedCount={owned}
          neededCount={needed}
        />
      ) : null}
    </div>
  )
}
