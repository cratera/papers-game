import { Color } from '@src/theme/colors'
import { SvgProps } from 'react-native-svg'
import avatars from './Illustrations'

export type IllustrationConfig = {
  bgColor: Color
  Component: (props: SvgProps) => JSX.Element
}

export type IllustrationName = keyof typeof avatars
