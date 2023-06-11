import { TouchableHighlightProps, ViewProps } from 'react-native'

export interface ButtonProps extends Omit<TouchableHighlightProps, 'style'> {
  variant?: 'primary' | 'success' | 'blank' | 'danger' | 'light' | 'ghost' | 'flat' | 'icon'
  size?: 'default' | 'sm' | 'lg'
  place?: 'edgeKeyboard' | 'float'
  isLoading?: boolean
  numberOfLines?: number
  style?: ViewProps['style']
  styleTouch?: TouchableHighlightProps['style']
  bgColor?: string
  textColor?: string
  loadingColor?: string
  disabled?: boolean
}
