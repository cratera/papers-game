import { SvgProps } from 'react-native-svg'

export interface TutorialStepProps {
  isActive: boolean
  ix: number
  stepTotal: number
}

export interface TutorialConfig {
  title: string
  detail: string | (() => JSX.Element)
  Illustration: (props: SvgProps) => JSX.Element
}
