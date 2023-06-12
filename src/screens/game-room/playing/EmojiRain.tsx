import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native'
import { EmojiRainProps } from './Playing.types'

const EmojiRain = ({ type }: EmojiRainProps) => {
  const emojis = type === 'winner' ? ['🎉', '🔥', '💖', '😃'] : ['🤡', '💩', '👎', '😓']
  const count = Array.from(Array(20), () => 1)
  const vh = Dimensions.get('window').height / 100
  const col = 5

  return (
    <View pointerEvents="none" style={Styles.container}>
      <Animated.View style={Styles.wrapper}>
        {count.map((x, index) => (
          <Text
            key={index}
            style={[
              Styles.text,
              {
                left: ((index % col) * 20 + (Math.floor(index / col) % 2 ? 10 : 0)) * vh,
                top: (Math.floor(index / col) + (index * 5 + 15) - 20) * vh,
              },
            ]}
          >
            {emojis[index % 4]}
          </Text>
        ))}
      </Animated.View>
    </View>
  )
}

export default EmojiRain

const Styles = StyleSheet.create({
  container: {
    zIndex: 2,
  },
  wrapper: {
    position: 'relative',
    opacity: 0.5,
  },
  text: {
    fontSize: 18,
    position: 'absolute',
  },
})
