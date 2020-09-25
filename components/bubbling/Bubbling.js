import React from 'react'
import PropTypes from 'prop-types'
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native'
import Constants from 'expo-constants'

import { window, isWeb } from '@constants/layout'

const Bubbling = ({ bgStart, bgEnd, fromBehind }) => {
  const animScaleGrow = React.useRef(new Animated.Value(0)).current
  const MOTION_ENABLED = React.useRef(!isWeb).current

  React.useEffect(() => {
    if (!MOTION_ENABLED) return

    Animated.timing(animScaleGrow, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      // easing: Easing.bezier(0, 0.5, 0.6, 1),
      useNativeDriver: Platform.OS !== 'web',
    }).start()
  }, [])

  if (!MOTION_ENABLED) {
    if (fromBehind) {
      return (
        <View
          style={[
            StylesBubble.bg,
            {
              backgroundColor: bgEnd,
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
        {
          backgroundColor: bgStart,
          zIndex: fromBehind ? 0 : 1,
          // opacity: 1,
          opacity: fromBehind
            ? 1
            : animScaleGrow.interpolate({
                inputRange: [0, 0.8, 0.9, 1],
                outputRange: [1, 1, 0, 0],
              }),
        },
      ]}
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

Bubbling.propTypes = {
  bgStart: PropTypes.string.isRequired,
  bgEnd: PropTypes.string.isRequired,
  fromBehind: PropTypes.bool,
}

export default Bubbling

const StylesBubble = StyleSheet.create({
  bg: {
    position: 'absolute',
    top: Constants.statusBarHeight * -1,
    left: 0,
    width: window.width,
    height: window.height,
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
