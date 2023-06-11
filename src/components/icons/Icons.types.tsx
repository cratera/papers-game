import { SvgProps } from 'react-native-svg'

export type UseProps = {
  size?: number
  color?: string
  style?: SvgProps['style']
}

export type IconProps = SvgProps & UseProps
