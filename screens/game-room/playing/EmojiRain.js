import React from 'react'
import { Animated, Dimensions, View, Text } from 'react-native'
import PropTypes from 'prop-types'

const EmojiRain = ({ type }) => {
  const emojis = type === 'winner' ? ['🎉', '🔥', '💖', '😃'] : ['🤡', '💩', '👎', '😓']
  const count = Array.from(Array(20), () => 1)
  const vh = Dimensions.get('window').height / 100
  const col = 5

  return (
    <View pointerEvents="none" style={{ zIndex: 2 }}>
      <Animated.View
        style={{
          position: 'relative',
          opacity: 0.5,
        }}
      >
        {count.map((x, index) => (
          <Text
            key={index}
            style={{
              fontSize: 18,
              position: 'absolute',
              left: ((index % col) * 20 + (Math.floor(index / col) % 2 ? 10 : 0)) * vh,
              top: (Math.floor(index / col) + (index * 5 + 15) - 20) * vh,
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
