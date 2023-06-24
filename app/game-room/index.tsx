import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

export default function GameRoom() {
  const router = useRouter()

  return (
    <View>
      <Text>Game room</Text>

      <Pressable onPress={() => router.push('/')}>
        <Text>Go back to home page</Text>
      </Pressable>
    </View>
  )
}
