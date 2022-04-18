type CardActionType = {
  description: string
}

type CardLevelType = {
  description: string
  life: number
  attack: number
  action: Array<CardActionType>
}

type CardType = {
  id: number
  name: string
  mana: number
  level: Array<CardLevelType>
}

export type { CardType, CardLevelType }
