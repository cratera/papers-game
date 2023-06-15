import { IconProps } from '@src/components/icons/Icons.types'
import { ViewProps } from 'react-native'

export interface ItemProps extends ViewProps {
  title: string
  description?: string
  hasDivider?: boolean
  variant?: 'danger'
  icon?: 'next' | string
  Icon?: (props: IconProps) => JSX.Element
  switchValue?: boolean
  onPress?: () => void
}
