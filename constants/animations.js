import { Animated } from 'react-native'

export const headerForFade = ({ current, next }) => {
  const opacity = Animated.add(current.progress, next ? next.progress : 0).interpolate({
    inputRange: [0, 1, 1],
    outputRange: [0, 1, 0],
  })

  return {
    leftButtonStyle: { opacity },
    rightButtonStyle: { opacity },
    titleStyle: { opacity },
    backgroundStyle: { opacity },
  }
}

export const cardForFade = ({ current, closing }) => ({
  cardStyle: {
    opacity: current.progress,
  },
})
