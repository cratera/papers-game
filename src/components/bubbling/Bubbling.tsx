import React from 'react'
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native'

import { window } from '@src/utils/device'
import { headerHeight } from '@src/utils/layout'

import PapersContext from '@src/store/PapersContext'
import { colors } from '@src/theme'
import { useEffectOnce } from 'usehooks-ts'
import { BubblingProps } from './Bubbling.types'

const Bubbling = ({ bgStart, bgEnd, fromBehind, ...props }: BubblingProps) => {
  const Papers = React.useContext(PapersContext)
  const motionEnabled = Papers.state.profile?.settings.motion
  const animScaleGrow = React.useRef(new Animated.Value(0)).current

  useEffectOnce(() => {
    if (!motionEnabled) return

    Animated.timing(animScaleGrow, {
      toValue: 1,
      duration: 800,
      easing: Easing.linear,
      useNativeDriver: Platform.OS !== 'web',
    }).start()
  })

  if (!motionEnabled) {
    if (fromBehind) {
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
    return null
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StylesBubble.bg,
        // eslint-disable-next-line react-native/no-inline-styles
        {
          backgroundColor: colors[bgStart],
          zIndex: fromBehind ? 0 : 1,
          opacity: fromBehind
            ? 1
            : animScaleGrow.interpolate({
                inputRange: [0, 0.8, 0.9, 1],
                outputRange: [1, 1, 0, 0],
              }),
        },
      ]}
      {...props}
    >
      <Animated.View
        style={[
          StylesBubble.bubble,
          {
            backgroundColor: bgEnd,

            transform: [
              {
                translateX: window.height / -2,
              },
              {
                translateY: window.height / -1.75,
              },
              {
                scale: animScaleGrow.interpolate({
                  inputRange: [0, 0.1, 1],
                  outputRange: [0, 0, 1.5],
                }),
              },
              { perspective: 1000 },
            ],
          },
        ]}
      />
    </Animated.View>
  )
}

export default Bubbling

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
    top: window.height / 2,
    left: window.width / 2,
    width: window.height,
    height: window.height,
    borderRadius: window.height / 2,
  },
})
