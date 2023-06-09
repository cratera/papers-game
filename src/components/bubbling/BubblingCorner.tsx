import React from 'react'
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native'

import { window } from '@src/utils/device'
import { headerHeight } from '@src/utils/layout'

import PapersContext from '@src/store/PapersContext'
import { colors } from '@src/theme'
import { useEffectOnce } from 'usehooks-ts'
import { BubblingCornerProps } from './Bubbling.types'

const getStyles = (
  corner: BubblingCornerProps['corner'],
  backgroundColor: BubblingCornerProps['bgEnd'],
  animScaleGrow: Animated.Value,
  inputRange: number[]
) => ({
  ...(corner === 'settings'
    ? {
        top: 220,
        left: window.width - 62,
      }
    : {
        top: window.height - 76,
        left: corner === 'bottom-right' ? window.width - 62 : 62,
      }),
  backgroundColor: colors[backgroundColor],
  transform: [
    {
      translateX: window.height / -2,
    },
    { perspective: 1000 },
    {
      translateY: window.height / -1.75,
    },
    {
      scale: animScaleGrow.interpolate({
        inputRange,
        outputRange: [0, 0, 2],
      }),
    },
  ],
})

const BubblingCorner = ({ duration, forced, corner, bgEnd, bgStart }: BubblingCornerProps) => {
  const Papers = React.useContext(PapersContext)
  const motionEnabled = Papers.state.profile?.settings.motion || forced
  const animScaleGrow = React.useRef(new Animated.Value(0)).current

  useEffectOnce(() => {
    if (!motionEnabled) return

    Animated.timing(animScaleGrow, {
      toValue: 1,
      duration,
      easing: Easing.linear,
      useNativeDriver: Platform.OS !== 'web',
    }).start()
  })

  if (!motionEnabled) {
    return (
      <View
        style={[
          StylesBubble.bg,
          {
            backgroundColor: colors[bgEnd],
          },
        ]}
      />
    )
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StylesBubble.bg,
        {
          backgroundColor: colors[bgStart],
          opacity:
            1 ||
            animScaleGrow.interpolate({
              inputRange: [0, 0.8, 0.9, 1],
              outputRange: [1, 1, 0, 0],
            }),
        },
      ]}
    >
      <Animated.View
        style={[StylesBubble.bubble, getStyles(corner, bgEnd, animScaleGrow, [0, 0, 0.6])]}
      />

      <Animated.View
        style={[StylesBubble.bubble, getStyles(corner, bgStart, animScaleGrow, [0, 0.4, 1])]}
      />
    </Animated.View>
  )
}

export default BubblingCorner

const StylesBubble = StyleSheet.create({
  bg: {
    position: 'absolute',
    top: headerHeight * -1,
    left: 0,
    width: window.width,
    // avoid somehow rare bug, where bg height does not cover fullscreen
    height: window.height + headerHeight,
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: window.height,
    height: window.height,
    borderRadius: window.height / 2,
  },
})
