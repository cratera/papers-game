import { Profile } from '@src/store/PapersContext.types'
import { ViewProps } from 'react-native'

export interface ListPlayersProps extends Omit<ViewProps, 'children'> {
  players: Profile['id'][]
  enableKickout?: boolean
  isStatusVisible?: boolean
  RenderSuffix?: ({ ix }: { ix: number }) => JSX.Element
}
