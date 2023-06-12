import { Profile, Turn } from '@src/store/PapersContext.types'
import { TouchableHighlightProps, ViewProps } from 'react-native'

export interface EmojiRainProps {
  type: 'winner' | 'loser'
}

export interface MyTurnGetReadyProps {
  description: string
  amIWaiting?: boolean
}

export interface MyTurnGoProps {
  startedCounting: boolean
  initialTimerSec: number
  countdown: number
  countdownSec: number
  isCount321go: boolean
}

export interface OtherTurnProps {
  description: string
  hasCountdownStarted: boolean
  countdownSec: number
  countdown: number
  initialTimerSec: number
  initialTimer: number
  thisTurnTeamName: string
  thisTurnPlayer: Pick<Profile, 'name' | 'avatar'>
  amIWaiting?: boolean
}

export interface TurnScoreProps {
  papersTurn: Turn
  type: 'timesup' | 'nowords'
  onTogglePaper: (paper: number, hasGuessed: boolean) => void
  onFinish: () => void
  isSubmitting?: boolean
  getPaperByKey: (key: number) => string
}

export interface ItemToggleProps extends ViewProps {
  onPress: TouchableHighlightProps['onPress']
}

export interface TurnStatusProps {
  title: string
  style?: ViewProps['style']
  player: Pick<Profile, 'name' | 'avatar'>
  teamName: string
}
