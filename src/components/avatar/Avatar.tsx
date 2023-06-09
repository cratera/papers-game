import { StyleSheet, Text, View } from 'react-native'

import * as Theme from '@src/theme'
import { colors } from '@src/theme'
import { AvatarProps } from './Avatar.types'
import avatars from './Illustrations'

export const sizes = {
  md: 40,
  lg: 64,
  ll: 88,
  xl: 104,
  xxl: 152,
  xxxl: 296,
}

export default function Avatar({
  src,
  isAfk,
  hasMargin,
  size = 'md',
  style,
  ...props
}: AvatarProps) {
  const avatar = avatars[src]

  if (!avatar) {
    throw new Error(`Avatar: "${src}" illustration doesn't exist.`)
  }

  const { bgColor, Component } = avatar

  return (
    <View
      style={[
        Styles.avatar,
        {
          backgroundColor: colors[bgColor],
          height: sizes[size],
          width: sizes[size],
        },
        hasMargin && Styles.margin,
        style,
      ]}
      {...props}
    >
      {isAfk ? <Text style={Styles.afk}>...</Text> : Component && <Component />}
    </View>
  )
}

const Styles = StyleSheet.create({
  avatar: {
    // borderColor: Theme.colors.grayDark,
    borderRadius: 12,
  },
  margin: {
    marginRight: 16,
  },
  afk: {
    fontSize: 25,
    lineHeight: 52, // TODO: hardcoded for size_lg :x (?)
    fontFamily: 'YoungSerif-Regular',
    color: Theme.colors.bg,
    textAlign: 'center',
  },
})
