import { Color } from '@src/theme/colors'
import { ViewProps } from 'react-native'

export interface BubblingProps extends Omit<ViewProps, 'pointerEvents' | 'children' | 'style'> {
  bgStart: Color
  bgEnd: Color
  fromBehind?: boolean
}

export interface BubblingCornerProps
  extends Pick<BubblingProps, 'bgStart' | 'bgEnd'>,
    Omit<ViewProps, 'pointerEvents' | 'children' | 'style'> {
  corner: 'bottom-right' | 'bottom-left' | 'settings'
  duration: number
  forced?: boolean
}
