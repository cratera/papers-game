import { colors } from '@src/theme'
import { SvgProps } from 'react-native-svg'
import avatars from './Illustrations'

export type IllustrationConfig = {
  bgColor: keyof typeof colors
  Component: (props: SvgProps) => JSX.Element
}

export type IllustrationName = keyof typeof avatars
