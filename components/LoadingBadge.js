import React from 'react'
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native'
import PropTypes from 'prop-types'

import * as Theme from '@theme'

// import * as Theme from '@theme'
// import Styles from './PlayingStyles.js'

const LoadingBadge = ({ children }) => {
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
    <View style={Styles.container}>
      <Animated.View
        style={[
          Styles.loader,
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
      <Text style={[Theme.typography.secondary, Styles.text]}>{children}</Text>
    </View>
  )
}

LoadingBadge.propTypes = {
  children: PropTypes.string,
}

export default LoadingBadge

const Styles = StyleSheet.create({
  container: {
    marginTop: 160,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  loader: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: Theme.colors.grayDark,
  },
  text: {
    marginTop: 24,
  },
})
