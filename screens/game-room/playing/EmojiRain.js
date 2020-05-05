import React from 'react'
import { Animated, Dimensions, View, Text } from 'react-native'
import PropTypes from 'prop-types'

// import * as Theme from '@theme'
// import Styles from './PlayingStyles.js'

const EmojiRain = ({ type }) => {
  const emojis = type === 'winner' ? ['🎉', '🔥', '💖', '😃'] : ['🤡', '💩', '👎', '😓']
  const count = Array.from(Array(20), () => 1)
  // const [fadeAnim] = React.useState(new Animated.Value(0)); // Initial value for opacity: 0
  // const [rainAnim] = React.useState(new Animated.Value(0)); // Initial value for opacity: 0

  // const vw = Dimensions.get('window').width / 100
  const vh = Dimensions.get('window').height / 100
  const col = 5

  // TODO animations.
  // React.useEffect(() => {
  //   Animated.timing(fadeAnim, {
  //     toValue: 1,
  //     duration: 1000,
  //   }).start();

  //   Animated.timing(rainAnim, {
  //     toValue: vh * 100,
  //     duration: 5000,
  //   }).start();
  // }, []);

  return (
    <View pointerEvents="none" style={{ zIndex: 2 }}>
      <Animated.View
        style={{
          position: 'relative',
          // opacity: fadeAnim,
        }}
      >
        {count.map((x, index) => (
          <Text
            key={index}
            style={{
              fontSize: 18,
              position: 'absolute',
              left: ((index % col) * 20 + (Math.floor(index / col) % 2 ? 10 : 0)) * vh,
              top: (Math.floor(index / col) * 15 + (index * 1.5 + 20)) * vh,
            }}
          >
            {emojis[index % 4]}
          </Text>
        ))}
      </Animated.View>
    </View>
  )
}

EmojiRain.propTypes = {
  type: PropTypes.oneOf(['winner', 'loser']),
}

export default EmojiRain
