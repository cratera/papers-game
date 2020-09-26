import React from 'react'
import PropTypes from 'prop-types'
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native'
import Constants from 'expo-constants'

import { window } from '@constants/layout'

import PapersContext from '@store/PapersContext.js'

const getStyles = (corner, backgroundColor, animScaleGrow, inputRange) => ({
  ...(corner === 'settings'
    ? {
        top: 220,
        left: window.width - 62,
      }
    : {
        top: window.height - 76,
        left: corner === 'bottom-right' ? window.width - 62 : 62,
      }),
  backgroundColor,
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

const BubblingCorner = ({ duration, forced, corner, bgEnd, bgStart }) => {
  const Papers = React.useContext(PapersContext)
  const motionEnabled = Papers.state.profile.settings.motion || forced
  const animScaleGrow = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    if (!motionEnabled) return

    Animated.timing(animScaleGrow, {
      toValue: 1,
      duration,
      easing: Easing.linear,
      useNativeDriver: Platform.OS !== 'web',
    }).start()
  }, [])

  if (!motionEnabled) {
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

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StylesBubble.bg,
        {
          backgroundColor: bgStart,
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

BubblingCorner.propTypes = {
  bgStart: PropTypes.string.isRequired,
  bgEnd: PropTypes.string.isRequired,
  corner: PropTypes.oneOf(['bottom-right', 'bottom-left', 'settings']),
  duration: PropTypes.number.isRequired,
  forced: PropTypes.bool, // force animation even when motion is disabled
}

export default BubblingCorner

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
    position: 'absolute',
    top: 0,
    left: 0,
    width: window.height,
    height: window.height,
    borderRadius: window.height / 2,
  },
})
