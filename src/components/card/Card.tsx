import { StyleSheet, View } from 'react-native'

import { isTamagoshi, window } from '@src/utils/device'

import { IllustrationCry, IllustrationSmile } from '@src/components/icons'
import * as Theme from '@src/theme'
import { CardProps } from './Card.types'

const illustrationMap = {
  'paper-cry': IllustrationCry,
  'paper-smile': IllustrationSmile,
}

export default function Card({ variant = 'paper-smile', style, ...props }: CardProps) {
  const Illustration = illustrationMap[variant]
  return (
    <View style={[Styles.slidePlaceholder, style]} {...props}>
      <Illustration />
    </View>
  )
}

const { vw } = window

const slideHeight = isTamagoshi ? 50 * vw : 70 * vw

const Styles = StyleSheet.create({
  slidePlaceholder: {
    height: slideHeight,
    backgroundColor: Theme.colors.bg,
    borderRadius: 12,
    padding: 15 * vw,
  },
})
