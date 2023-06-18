import React from 'react'
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native'

import * as Theme from '@src/theme'
import { LoadingBadgeProps } from './LoadingBadge.types'

const sizes = {
  sm: 16,
  md: 24,
}

const LoadingBadge = ({ children, size = 'md', variant, style, ...props }: LoadingBadgeProps) => {
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
  }, [animSpin])

  return (
    <View style={[Styles.container, variant === 'page' && Styles.container_page, style]} {...props}>
      <Animated.View
        style={[
          Styles.loader,
          {
            height: sizes[size],
            width: sizes[size],
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
          variant === 'page' ? Theme.spacing.mt_24 : Theme.spacing.mt_12,
        ]}
      >
        {children}
      </Text>
    </View>
  )
}

export default LoadingBadge

const Styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  container_page: {
    marginTop: 160,
  },
  loader: {
    borderWidth: 1,
    borderColor: Theme.colors.grayDark,
  },
})
