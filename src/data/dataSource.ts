import { gameData, isDataStale } from '../domain/gameData'
import type { GameData } from '../domain/types'

export interface GameDataSource {
  getData(): GameData
  isStale(): boolean
  getMeta(): { dataVersion: string; lastUpdated: string; gameVersion: string }
}

export class StaticGameDataSource implements GameDataSource {
  getData(): GameData {
    return gameData
  }

  isStale(): boolean {
    return isDataStale()
  }

  getMeta() {
    return {
      dataVersion: gameData.dataVersion,
      lastUpdated: gameData.lastUpdated,
      gameVersion: gameData.gameVersion,
    }
  }
}

export const gameDataSource: GameDataSource = new StaticGameDataSource()
