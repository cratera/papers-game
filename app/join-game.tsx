import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

export default function JoinGame() {
  const router = useRouter()

  return (
    <View>
      <Text>Join game</Text>

      <Pressable onPress={() => router.push('/')}>
        <Text>Go back to home page</Text>
      </Pressable>
    </View>
  )
}
