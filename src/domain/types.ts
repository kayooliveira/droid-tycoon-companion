export type TierId =
  | 'default'
  | 'gold'
  | 'diamond'
  | 'rainbow'
  | 'beskar'
  | 'galactic'
  | 'stellar'
  | 'kyber'
  | 'scourge'

export type BaseRarityId =
  | 'common'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic'
  | 'iconic'

export type DroidClass = 'Worker' | 'Astromech' | 'Battle' | 'Protocol'

export type Confidence = 'confirmed' | 'partial' | 'unverified'

export interface Requirement {
  droidId: string
  rarity: TierId
  quantity: number
}

export interface RebirthEntry {
  rebirth: number
  credits: string
  unlocks: string | null
  requirements: Requirement[]
  sourceUrl: string
  lastVerified: string
  confidence: Confidence
  note?: string
  confidenceNote?: string
  crossCheck?: Record<string, string>
  alternatives?: Requirement[][]
}

export interface Cycle {
  id: string
  name: string
  pathNumber?: number
  rebirths: RebirthEntry[]
}

export interface Droid {
  id: string
  name: string
  class: DroidClass
  baseRarity: string
  fusionOnly: boolean
  tiersAvailable: TierId[]
  imageUrl?: string
  imageLocal?: string
  imageMissing?: boolean
  requiredIn?: Array<{ cycle: string; rebirth: number; rarity: TierId }>
  sourceUrl: string
  lastVerified: string
  confidence: Confidence
}

export interface InventoryUnit {
  id: string
  droidId: string
  tier: TierId
  quantity: number
}

export type RequirementStatus =
  | 'missing'
  | 'owned'
  | 'ready'
  | 'keep'
  | 'sellable'
  | 'upgrade'

export interface FusionRecipe {
  id: string
  type: string
  resultDroidId: string
  resultBaseRarity?: string
  ingredients: Array<{ droidId: string; quantity: number }>
  resultTierRule?: string
  confidence?: Confidence
  sourceUrl?: string
}

export interface GameData {
  schemaVersion: number
  dataVersion: string
  lastUpdated: string
  gameVersion: string
  staleAfterDays: number
  droids: Droid[]
  cycles: Cycle[]
  rarities: Array<{ id: TierId; name: string; order: number }>
  baseRarities: Array<{ id: BaseRarityId; name: string; order: number }>
  fusions: FusionRecipe[]
  fusionRules: Array<{ summary?: string; text?: string }>
  rules: Record<string, unknown>
  sources: Array<{ url?: string; name?: string }>
}
