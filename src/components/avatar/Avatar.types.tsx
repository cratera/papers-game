import { ViewProps } from 'react-native'

import { sizes } from './Avatar'
import { IllustrationName } from './Illustrations.types'

export interface AvatarProps extends Omit<ViewProps, 'children'> {
  src: IllustrationName
  /**
   * @default 'md'
   */
  size?: keyof typeof sizes
  isAfk?: boolean
  hasMargin?: boolean
  style?: Omit<
    ViewProps['style'],
    'backgroundColor' | 'borderRadius' | 'marginRight' | 'height' | 'width'
  >
}
