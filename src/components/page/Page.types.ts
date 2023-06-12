import { Color } from '@src/theme/colors'
import { ViewProps } from 'react-native'
import { SafeAreaViewProps } from 'react-native-safe-area-context'
import { ButtonProps } from '../button/Button.types'

export interface PageProps extends SafeAreaViewProps {
  bannerMsg?: string | boolean
  /**
   * @default grayBg
   */
  bgFill?: Color
  styleInner?: ViewProps['style']
}

export interface HeaderBtnProps extends Omit<ButtonProps, 'title' | 'color'> {
  side: 'left' | 'left-close' | 'right'
  isLoading?: boolean
}

export interface CTAsProps extends ViewProps {
  hasOffset?: boolean
}
