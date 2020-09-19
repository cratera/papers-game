import React from 'react'
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native'
import PropTypes from 'prop-types'

import * as Theme from '@theme'

// import * as Theme from '@theme'
// import Styles from './PlayingStyles.js'

const LoadingBadge = ({ children, size, variant, style, ...otherProps }) => {
  const animSpin = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(animSpin, {
        toValue: 1,
        duration: 1500,
        easing: Easing.bezier(1, 0.27, 0.71, 0.79), // Review @mmbotelho
        useNativeDriver: Platform.OS !== 'web',
      }),
      { iterations: 50 }
    ).start()
  }, [])

  return (
    <View
      style={[
        Styles.container,
        variant === 'page' && {
          marginTop: 160,
        },
        style,
      ]}
      {...otherProps}
    >
      <Animated.View
        style={[
          Styles.loader,
          Styles[`size_${size}`],
          {
            transform: [
              {
                rotate: animSpin.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '540deg'],
                }),
              },
              { perspective: 1000 },
            ],
          },
        ]}
      />
      <Text
        style={[
          Theme.typography.secondary,
          {
            marginTop: variant === 'page' ? 24 : 12,
          },
        ]}
      >
        {children}
      </Text>
    </View>
  )
}

LoadingBadge.defaultProps = {
  size: 'md',
}

LoadingBadge.propTypes = {
  children: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md']),
  variant: PropTypes.oneOf(['page']),
  style: PropTypes.any,
}

export default LoadingBadge

const Styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  loader: {
    borderWidth: 1,
    borderColor: Theme.colors.grayDark,
  },
  size_sm: {
    width: 16,
    height: 16,
  },
  size_md: {
    width: 24,
    height: 24,
  },
})
