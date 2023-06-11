import { Profile } from '@src/store/PapersContext.types'
import { ViewProps } from 'react-native'
import { podiumMap } from './CardScore'

export interface CardScoreProps extends Omit<ViewProps, 'children'> {
  index: keyof typeof podiumMap
  isTie: boolean
  teamName: string
  scoreTotal: number
  scoreRound: number
  playersSorted: {
    id: Profile['id']
    score: number
  }[]
}

export interface PlayerItemScoreProps {
  ix: number
  score: number
}
