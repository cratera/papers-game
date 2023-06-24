import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

export default function CreateGame() {
  const router = useRouter()

  return (
    <View>
      <Text>Create game</Text>

      <Pressable onPress={() => router.push('/')}>
        <Text>Go back to home page</Text>
      </Pressable>
    </View>
  )
}
