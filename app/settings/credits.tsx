import { Stack, useRouter } from 'expo-router'
import { ScrollView, Text } from 'react-native'

import Page from '@src/components/page'
import headerTheme from '@src/navigation/headerTheme'
import * as Theme from '@src/theme'

export default function Credits() {
  const router = useRouter()

  return (
    <Page>
      <Stack.Screen
        options={{
          ...headerTheme(),
          headerTitle: 'Credits',
          headerLeft: () => (
            <Page.HeaderBtn side="left" onPress={() => router.push('/settings')}>
              Back
            </Page.HeaderBtn>
          ),
        }}
      />

      <Page.Main style={Theme.spacing.pt_24}>
        <ScrollView>
          <Text style={Theme.typography.body}>TODO: Acknowledgments on the way...</Text>
        </ScrollView>
      </Page.Main>
    </Page>
  )
}
